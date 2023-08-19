from __future__ import division
from flask import Flask,render_template,url_for,request
import pandas as pd 
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import tensorflow
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense, Activation
# from tensorflow.keras.models import load_model
from flask import jsonify
import joblib
import copy
from lime.lime_text import LimeTextExplainer
from sklearn.pipeline import make_pipeline
## clova ocr
import requests
import uuid
import time
import json
import os
## stt
import pyaudio
import io
import wave
import re
import sys

from google.cloud import speech

import pyaudio
# from six.moves import queue



app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './'



##SVM 모델 전처리
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

nltk.download('stopwords')
nltk.download('punkt')

stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))

def preprocess_svm(email):
	#Convert to lowercase
	email = email.lower()
	#Tokenize the email
	words = word_tokenize(email)
	#Remove stop words
	words = [w for w in words if w not in stop_words]
	#Stem the words
	words = [stemmer.stem(w) for w in words]
	#Join the words back into a single string
	email = ' '.join(words)
	return email


#NB
def NB():
	NB_vect = joblib.load('NB_vectorizer.pkl')
	NB_model = joblib.load('NB_model.pkl')
	return(NB_vect, NB_model)

#SVM
def SVM():
	svm_vect = joblib.load('svm_vectorizer.pkl')
	svm_model = joblib.load('svm_model.pkl')
	return(svm_vect, svm_model)




#Image -> Text 후 Spam 검사
@app.route('/convert/image', methods=['POST'])
def convertImage():
	import json
	image = request.files['image']
	filepath = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
	image.save(filepath)
	image_file = filepath

	print(image_file)

	# 이미지 처리 로직 작성
	api_url = 'https://ywfsh0h15b.apigw.ntruss.com/custom/v1/23768/4747a73a47d3b6a70bebaaa85c450d91240ccbefdf1363ce9a10bcef1c6534e1/general'
	secret_key = 'b2ZKTVhBTVRZdldGSE92QXdodG9PTkVpc0hEa25PdnU='
	#image_file = './text.jpg'

	request_json = {
		'images': [
			{
				'format': 'jpg',
				'name': 'demo'
			}
		],
		'requestId': str(uuid.uuid4()),
		'version': 'V2',
		'timestamp': int(round(time.time() * 1000))
	}

	payload = {'message': json.dumps(request_json).encode('UTF-8')}
	files = [
	('file', open(image_file,'rb'))
	]
	headers = {
	'X-OCR-SECRET': secret_key
	}

	response = requests.request("POST", api_url, headers=headers, data = payload, files = files)

	#print(response.text.encode('utf8'))

	result = response.json()
	with open('result.json','w',encoding='utf-8') as make_file:
		json.dump(result, make_file, indent='\t')
	
	text = ""
	for field in result['images'][0]['fields']:
		text += field['inferText'] + ' '
	#print(text)

	text2 = copy.deepcopy(text)
	value = text


	NB_vect = NB()[0]
	NB_model = NB()[1]

	cv1 = NB_vect #NB에서 training에 사용된 데이터를 fit
	vect = cv1.transform([value]).toarray()
	from sklearn.metrics import accuracy_score

	# 단어들

	pipeline = make_pipeline(cv1, NB_model)  # 텍스트 데이터 벡터화 및 분류 모델링
	class_names = ['0', '1']
	explainer = LimeTextExplainer(class_names=class_names)
	exp1 = explainer.explain_instance(value, pipeline.predict_proba, num_features=6) #NB(df)[4]는 NB의 explainer, [3]은 NB pipeline
	sorted_exp1 = sorted(exp1.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
	my_prediction1 = NB_model.predict(vect) #NB(df)[1]은 NB clf
	print("NB sorted : ",sorted_exp1)
	print("NB sorted : ",my_prediction1)
	
	import json
	s = list(sorted_exp1)
	ll = {'category':[],'value':[]}
	for i in s :
		if i[0] not in ll['category'] :
			ll['category'].append(str(i[0]))
			ll['value'].append((round(i[1]*100,2)))
	#그래프
	
	cv2 = SVM()[0]
	svm_model = SVM()[1]
	vect2 = cv2.transform([text2]).toarray()
	my_prediction2 = SVM()[1].predict(vect2)  #SVM의 clf.predict(vect)
	
	# 단어들
	pipeline2 = make_pipeline(cv2, SVM()[1])  # 텍스트 데이터 벡터화 및 분류 모델링
	class_names = ['0', '1']
	explainer2 = LimeTextExplainer(class_names=class_names)

	exp2 = explainer2.explain_instance(text2, pipeline2.predict_proba, num_features=6)
	#print(exp2.as_list())
	sorted_exp2 = sorted(exp2.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
	my_prediction2 = svm_model.predict(vect2)
	print("SVM sorted : ",sorted_exp2)
	print("SVM my prediction :" , my_prediction2)
		

	s2 = sorted_exp2
	l2={'category':[],'value':[]}
	for i2 in s2 :
		if i2[0] not in l2['category'] :
			l2['category'].append(str(i2[0]))
			l2['value'].append((round(i2[1]*100,2)))
			

	
	# 처리 결과를 'result' 필드에 담아서 JSON 응답으로 반환
	return jsonify({
		'text': text, 
		'result1': '스팸' if my_prediction1 == 'spam' else '햄',
		'result2': '스팸' if my_prediction2 == 'spam' else '햄',
		'vocabs1' : ll, 
		'vocabs2' : l2
		})


#Audio -> Text
@app.route('/convert/audiofile', methods=['POST'])
def saveAudio():
    audio = request.files['audio']
    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
    audio.save(audio_file)
    
    result = convertAudio('audio.wav')
    return jsonify({'result' : result})
    
def convertAudio(audio_file):
    from google.cloud import speech
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="C:\stt-test-key.json"
    client = speech.SpeechClient()
    #file_name = os.path.join(os.path.dirname(__file__), ".", "file.wav")
    with io.open(audio_file, "rb") as audio_file:
        content = audio_file.read()
        audio = speech.RecognitionAudio(content=content)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        #sample_rate_hertz=16000,
        sample_rate_hertz=44100,
        language_code="en-US",
        audio_channel_count = 2,
    )

    # Detects speech in the audio file
    response = client.recognize(config=config, audio=audio)
    result = ""
    for res in response.results:
        result += "{}".format(res.alternatives[0].transcript)
    return result

import pyaudio
import wave
## 스트리밍 처리
@app.route('/convert/start_record', methods=['POST'])
def recorder():
    FORMAT = pyaudio.paInt16
    CHANNELS = 2
    RATE = 44100
    CHUNK = 1024
    RECORD_SECONDS = 10
    WAVE_OUTPUT_FILENAME = "streaming.wav"
    global recording
    recording = True
    audio = pyaudio.PyAudio()

    # start Recording
    stream = audio.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)
    print ("recording...")
    frames = []

    while recording:
        data = stream.read(CHUNK)
        frames.append(data)
    print ("finished recording")

    # stop Recording
    stream.stop_stream()
    stream.close()
    audio.terminate()

    waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    waveFile.setnchannels(CHANNELS)
    waveFile.setsampwidth(audio.get_sample_size(FORMAT))
    waveFile.setframerate(RATE)
    waveFile.writeframes(b''.join(frames))
    waveFile.close()
    result = convertAudio(WAVE_OUTPUT_FILENAME)
    print(result)
    cv1 = cv.fit(NB(df)[5])
    vect1 = cv1.transform([result]).toarray()
    my_prediction1 = NB(df)[1].predict(vect1)  #NB의 clf.predict(vect)
    print(my_prediction1)
    cv2 = cv.fit(SVM(df)[5])
    vect2 = cv2.transform([result]).toarray()
    my_prediction2 = SVM(df)[1].predict(vect2)  #NB의 clf.predict(vect)
    print(my_prediction2)
    # 처리 결과를 'result' 필드에 담아서 JSON 응답으로 반환
    return jsonify({'text': result, 'result1': '스팸' if my_prediction1 == 1 else '햄', 'result2': '스팸' if my_prediction2 == 1 else '햄'})

@app.route('/convert/stop_record', methods=['POST'])
def stop_record():
    global result
    global recording
    recording = False
    return jsonify({'result' : "stop"})

#Text Spam 검사
@app.route('/predict',methods=['POST'])
def predict():
	if request.method == 'POST':
		data = request.get_json()
		data2 = copy.deepcopy(data)

		section = data['section']
		value = data['value']
		value2 = preprocess_svm(data2['value'])
		#value = data['email']

		#NB predict
		NB_vect = NB()[0]
		NB_model = NB()[1]

		cv1 = NB_vect #NB에서 training에 사용된 데이터를 fit
		vect = cv1.transform([value]).toarray()
		from sklearn.metrics import accuracy_score
		accuracy1 = NB_model.predict_proba(vect)[0, 1]

		# 단어들
		pipeline = make_pipeline(cv1, NB_model)  # 텍스트 데이터 벡터화 및 분류 모델링
		class_names = ['0', '1']
		explainer = LimeTextExplainer(class_names=class_names)

		exp1 = explainer.explain_instance(value, pipeline.predict_proba, num_features=6) #NB(df)[4]는 NB의 explainer, [3]은 NB pipeline
		print(exp1.as_list())
		sorted_exp1 = sorted(exp1.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열

		my_prediction1 = NB_model.predict(vect) #NB(df)[1]은 NB clf
		print(sorted_exp1)
		print(my_prediction1)
		
		import json
		s = list(sorted_exp1)
		l1 = {'category':[],'value':[]}
		for i in s :
			if i[0] not in l1['category'] :
				l1['category'].append(str(i[0]))
				l1['value'].append((round(i[1]*100,2)))

		#SVM predict
		svm_vect = SVM()[0]
		svm_model = SVM()[1]

		cv2 = svm_vect
		vect2 = cv2.transform([value2]).toarray()
		accuracy2 = svm_model.predict_proba(vect2)[0,1]

		# 단어들
		pipeline2 = make_pipeline(cv2, svm_model)  # 텍스트 데이터 벡터화 및 분류 모델링
		class_names = ['0', '1']
		explainer2 = LimeTextExplainer(class_names=class_names)

		exp2 = explainer2.explain_instance(value2, pipeline2.predict_proba, num_features=6)
		print(exp2.as_list())
		sorted_exp2 = sorted(exp2.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
		my_prediction2 = svm_model.predict(vect2)
		print(sorted_exp2)
		print(my_prediction2)


		s2 = sorted_exp2
		l2={'category':[],'value':[]}
		for i2 in s2 :
			if i2[0] not in l2['category'] :
				l2['category'].append(str(i2[0]))
				l2['value'].append((round(i2[1]*100,2)))
	

	return jsonify({
		'result1': '스팸' if my_prediction1 == 'spam' else '햄', 
		'result2': '스팸' if my_prediction2 == 'spam' else '햄', 
		'vocabs1' : l1, 
		'vocabs2' : l2})


@app.route('/')
def home():
	return render_template('home.html')
@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.get_json()
    section = data['section']
    value = data['value']
    # 입력값에 대한 처리 로직 작성
    return jsonify({'message': 'Conversion successful'})

if __name__ == '__main__':
        app.run(host='0.0.0.0', debug=True)
        