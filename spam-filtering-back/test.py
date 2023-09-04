from __future__ import division
from flask import Flask,render_template,url_for,request
import pandas as pd 
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
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
from six.moves import queue



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
	NB_vect = joblib.load('NB_vectorizer_ex.pkl')
	NB_model = joblib.load('NB_model_ex.pkl')
	return(NB_vect, NB_model)

#SVM
def SVM():
	svm_vect = joblib.load('svm_vectorizer_ex.pkl')
	svm_model = joblib.load('svm_model_ex.pkl')
	return(svm_vect, svm_model)



#Image -> Text 후 Spam 검사

@app.route('/convert/image', methods=['POST'])
def convertImage():
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
	result = response.json()
	with open('result.json','w',encoding='utf-8') as make_file:
		json.dump(result, make_file, indent='\t')
	
	text = ""
	for field in result['images'][0]['fields']:
		text += field['inferText'] + ' '
	#print(text)
	res = total_predict(text)
	
	return res


#Audio -> Text
@app.route('/convert/audio', methods=['POST'])
def saveAudio():
    audio = request.files['audio']
    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
    audio.save(audio_file)
    
    converted_text = convertAudio('audio.wav')
    result = total_predict(converted_text)
    print(result)
    return result
    
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
    converted_text = convertAudio(WAVE_OUTPUT_FILENAME)
    result = total_predict(converted_text)
    return result

@app.route('/convert/stop_record', methods=['POST'])
def stop_record():
    global result
    global recording
    recording = False
    return jsonify({'result' : "stop"})

#Text Spam 검사
@app.route('/predict',methods=['POST'])
def pedict():
	if request.method == 'POST':
		data = request.get_json()['value']
		result = total_predict(data)
		print(result)
		return result

def total_predict(text):
	value = text
	if text == "":
		raise ValueError("No String")
	value2 = preprocess_svm(text)

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

	### 스팸 단어 보이기
	#sorted_exp1 = sorted(exp1.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
	#positive_sorted_exp1 = [item for item in sorted_exp1 if item[1] > 0] # 스팸인것만 (양수) 남기기
	### 

	my_prediction1 = NB_model.predict(vect) #NB(df)[1]은 NB clf

	### 스팸이면 스팸 단어, 햄이면 햄 단어 보이기
	if my_prediction1 == 'spam' :
		sorted_exp1 = sorted(exp1.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
		positive_sorted_exp1 = [item for item in sorted_exp1 if item[1] > 0] # 스팸인것만 (양수) 남기기
	else : 
		sorted_exp1 = sorted(exp1.as_list(), key=lambda x: x[1], reverse=False) #스팸 의심 높은것부터 나열
		positive_sorted_exp1 = [item for item in sorted_exp1 if item[1] < 0] # 햄인것만 (음수) 남기기
	print(sorted_exp1)
	print(my_prediction1)
	### 
	
	import json
	s = list(positive_sorted_exp1)
	l1 = {'category':[],'value':[]}
	for i in s :
		if i[0] not in l1['category'] :
			l1['category'].append(str(i[0]))
			l1['value'].append((round(i[1]*100,2)))
	print("executed")
	#SVM predict
	svm_vect = SVM()[0]
	svm_model = SVM()[1]
	print("executed2")
	cv2 = svm_vect
	vect2 = cv2.transform([value2]).toarray()
	accuracy2 = svm_model.predict_proba(vect2)[0,1]
	print("executed3")
	# 단어들
	pipeline2 = make_pipeline(cv2, svm_model)  # 텍스트 데이터 벡터화 및 분류 모델링
	class_names = ['0', '1']
	explainer2 = LimeTextExplainer(class_names=class_names)
	print("executed4")
	exp2 = explainer2.explain_instance(value2, pipeline2.predict_proba, num_features=6)
	print(exp2.as_list())
	
	### 스팸 단어 보이기
	#sorted_exp2 = sorted(exp2.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
	#positive_sorted_exp2 = [item for item in sorted_exp2 if item[1] > 0] # 스팸인것만 (양수) 남기기
	###
	
	my_prediction2 = svm_model.predict(vect2)
	### 스팸이면 스팸 단어, 햄이면 햄 단어 보이기
	#'''
	if my_prediction2 == 'spam' :
		sorted_exp2 = sorted(exp2.as_list(), key=lambda x: x[1], reverse=True) #스팸 의심 높은것부터 나열
		positive_sorted_exp2 = [item for item in sorted_exp2 if item[1] > 0] # 스팸인것만 (양수) 남기기
	else : 
		sorted_exp2 = sorted(exp2.as_list(), key=lambda x: x[1], reverse=False) #스팸 의심 높은것부터 나열
		positive_sorted_exp2 = [item for item in sorted_exp2 if item[1] < 0] # 햄인것만 (음수) 남기기
	print(sorted_exp2)
	print(my_prediction2)
	#'''
	###


	s2 = positive_sorted_exp2
	l2={'category':[],'value':[]}
	for i2 in s2 :
		if i2[0] not in l2['category'] :
			l2['category'].append(str(i2[0]))
			l2['value'].append((round(i2[1]*100,2)))


	return jsonify({
		'text' : text,
		'result1': '스팸' if my_prediction1 == 'spam' else '햄', 
		'result2': '스팸' if my_prediction2 == 'spam' else '햄', 
		'vocabs1' : l1, 
		'vocabs2' : l2})


@app.route('/')
def home():
	return render_template('home.html')

if __name__ == '__main__':
        app.run(host='0.0.0.0', debug=True)
        