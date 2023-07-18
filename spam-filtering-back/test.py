from flask import Flask,render_template,url_for,request
import pandas as pd 
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from flask import jsonify
import joblib
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

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './'


@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.get_json()
    section = data['section']
    value = data['value']

    # 입력값에 대한 처리 로직 작성

    return jsonify({'message': 'Conversion successful'})


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

	#print(response.text.encode('utf8'))

	result = response.json()
	with open('result.json','w',encoding='utf-8') as make_file:
		json.dump(result, make_file, indent='\t')
	
	text = ""
	for field in result['images'][0]['fields']:
		text += field['inferText'] + ' '
	#print(text)
	
	## 스팸 판단
	df= pd.read_csv("spam.csv", encoding="latin-1")
	df.drop(['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4'], axis=1, inplace=True)
	# Features and Labels
	df['label'] = df['v1'].map({'ham': 0, 'spam': 1})
	X = df['v2']
	y = df['label']
	
	cv = CountVectorizer()
	# Extract Feature With CountVectorizer
	X = cv.fit_transform(X) # Fit the Data
	from sklearn.model_selection import train_test_split
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
	#Naive Bayes Classifier
	from sklearn.naive_bayes import MultinomialNB

	clf = MultinomialNB()
	clf.fit(X_train,y_train)
	#clf.score(X_test,y_test)
	#Alternative Usage of Saved Model
	#joblib.dump(clf, 'NB_spam_model.pkl')
	#NB_spam_model = open('NB_spam_model.pkl','rb')
	vect = cv.transform([text]).toarray()
	
	my_prediction = clf.predict(vect)
	
	##스팸 판단 end
	


	# 처리 결과를 'result' 필드에 담아서 JSON 응답으로 반환
	return jsonify({'text': text,
                 	'result': '스팸' if my_prediction == 1 else '햄'})

@app.route('/convert/audio', methods=['POST'])
def convertAudio():
    audio = request.files['audio']
    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
    print(audio_file)
    audio.save(audio_file)
    
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
    
    return jsonify({'result' : result})

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/predict',methods=['POST'])
def predict():

	df= pd.read_csv("spam.csv", encoding="latin-1")
	df.drop(['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4'], axis=1, inplace=True)
	# Features and Labels
	df['label'] = df['v1'].map({'ham': 0, 'spam': 1})
	X = df['v2']
	y = df['label']
	
	cv = CountVectorizer()
	# Extract Feature With CountVectorizer
	X = cv.fit_transform(X) # Fit the Data
	from sklearn.model_selection import train_test_split
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
	#Naive Bayes Classifier
	from sklearn.naive_bayes import MultinomialNB

	clf = MultinomialNB()
	clf.fit(X_train,y_train)
	#clf.score(X_test,y_test)
	#Alternative Usage of Saved Model
	joblib.dump(clf, 'NB_spam_model.pkl')
	NB_spam_model = open('NB_spam_model.pkl','rb')
	clf = joblib.load(NB_spam_model)

	if request.method == 'POST':
		data = request.get_json()
		section = data['section']
		value = data['value']
		#value = data['email']
		vect = cv.transform([value]).toarray()
		
		my_prediction = clf.predict(vect)
	#return render_template('result.html',prediction = my_prediction)
	return jsonify({'result': '스팸' if my_prediction == 1 else '햄'})



if __name__ == '__main__':
        app.run(host='0.0.0.0', debug=True)
        