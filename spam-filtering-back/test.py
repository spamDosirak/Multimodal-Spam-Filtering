from flask import Flask,render_template,url_for,request
import pandas as pd 
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation
from tensorflow.keras.models import load_model
from flask import jsonify
import joblib
import copy
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


##스팸 분류를 위한 모델 생성부분은 공통되는 부분으로 코드 중복이 너무 많이 돼서 따로 빼놨습니다.
#NB
df= pd.read_csv("./spam.csv", encoding="latin-1")
df.drop(['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4'], axis=1, inplace=True)
df['label'] = df['v1'].map({'ham': 0, 'spam': 1})
cv = CountVectorizer()

def fit_data(cv,X,y):	
	X = cv.fit_transform(X) # Fit the Data
	from sklearn.model_selection import train_test_split
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
	return(X_train, X_test, y_train, y_test)
	
#NB
def NB(df):
	X = df['v2']
	y = df['label']
	X_train, X_test, y_train, y_test = fit_data(cv, X, y)

	from sklearn.naive_bayes import MultinomialNB
	clf = MultinomialNB()
	clf.fit(X_train,y_train)
	y_pred = clf.predict(X_test)

	from sklearn.pipeline import make_pipeline
	from lime import lime_text
	from lime.lime_text import LimeTextExplainer
	from sklearn.pipeline import make_pipeline
	pipeline = make_pipeline(cv, clf) # 텍스트 데이터 벡터화 및 분류 모델링
	class_names=['0','1']
	explainer = LimeTextExplainer(class_names=class_names)
	return(y_test, clf, y_pred, pipeline, explainer, X)

#SVM
def SVM(df):
	X = df['v2'].apply(preprocess_svm)
	y = df['label']
	X_train, X_test, y_train, y_test = fit_data(cv, X, y)

	from sklearn.svm import SVC
	clf = SVC(kernel='linear', C=1, probability=True, random_state=42)
	clf.fit(X_train,y_train)
	y_pred = clf.predict(X_test)

	from sklearn.pipeline import make_pipeline
	from lime import lime_text
	from lime.lime_text import LimeTextExplainer
	from sklearn.pipeline import make_pipeline
	pipeline = make_pipeline(cv, clf) # 텍스트 데이터 벡터화 및 분류 모델링
	class_names=['0','1']
	explainer = LimeTextExplainer(class_names=class_names)
	return(y_test, clf, y_pred, pipeline, explainer, X)




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

	#print(response.text.encode('utf8'))

	result = response.json()
	with open('result.json','w',encoding='utf-8') as make_file:
		json.dump(result, make_file, indent='\t')
	
	text = ""
	for field in result['images'][0]['fields']:
		text += field['inferText'] + ' '
	#print(text)
	
	cv1 = cv.fit(NB(df)[5])
	vect1 = cv1.transform([text]).toarray()
	my_prediction1 = NB(df)[1].predict(vect1)  #NB의 clf.predict(vect)
	
	cv2 = cv.fit(SVM(df)[5])
	vect2 = cv2.transform([text]).toarray()
	my_prediction2 = SVM(df)[1].predict(vect2)  #NB의 clf.predict(vect)
	
	# 처리 결과를 'result' 필드에 담아서 JSON 응답으로 반환
	return jsonify({'text': text, 'result1': '스팸' if my_prediction1 == 1 else '햄', 'result2': '스팸' if my_prediction2 == 1 else '햄'})


#Audio -> Text
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
		cv1 = cv.fit(NB(df)[5]) #NB에서 training에 사용된 데이터를 fit
		vect = cv1.transform([value]).toarray()
		from sklearn.metrics import accuracy_score
		accuracy1 = accuracy_score(NB(df)[0], NB(df)[2]) #NB(df)[0]는 NB에서의 y_pred
		#단어들
		exp1 = NB(df)[4].explain_instance(value, NB(df)[3].predict_proba, num_features=6) #NB(df)[4]는 NB의 explainer, [3]은 NB pipeline
		print(exp1.as_list())
		prediction1 = NB(df)[3].predict_proba([value])[0,1]
		my_prediction1 = NB(df)[1].predict(vect) #NB(df)[1]은 NB clf
		print((exp1).as_list())
		
		import json
		s = list(exp1.as_list())
		l = {}
		for i in s :
			if i[0] not in l :
				l[i[0]] = round(i[1]*100,2)

		#SVM predict
		svm_vect = joblib.load('svm_vectorizer.pkl')
		svm_model = joblib.load('svm_model.pkl')

		cv2 = svm_vect
		vect2 = cv2.transform([value2]).toarray()
		#accuracy2 = accuracy_score(SVM(df)[0], SVM(df)[2]) #순서 NB와 동일
		accuracy2 = svm_model.predict_proba(vect2)[0,1]

		#단어들
		exp2 = SVM(df)[4].explain_instance(value2, SVM(df)[3].predict_proba, num_features=6)
		print(exp2.as_list())
		prediction2 = SVM(df)[3].predict_proba([value2])[0,1]
		my_prediction2 = svm_model.predict(vect2)
		print((exp2).as_list())
		print(my_prediction2)



		s2 = list(exp2.as_list())
		l2 = {}
		for i2 in s2 :
			if i2[0] not in l2 :
				l2[i2[0]] = round(i2[1]*100,2)

		test_data = {'result1':  '%.2f 확률로 스팸' % accuracy1 if my_prediction1 == 1 else '%.2f 확률로 햄' % accuracy1, 'result2':  '%.2f 확률로 스팸' % accuracy2 if my_prediction2 == 'spam' else '%.2f 확률로 햄' % accuracy2 }
		#test_data2 = {'result': str((exp).as_list()) + '%.2f 확률로 스팸' % prediction if my_prediction == 1 else '%.2f 확률로 햄' % prediction }
		#test_data10 = {'result' : json.dumps(l,indent=10)}
		#test_data3 = {'result': '스팸' if my_prediction == 1 else '햄', 'vocabs' : json.dumps(l,indent=10)}

	return jsonify({'result1': '스팸' if my_prediction1 == 1 else '햄', 'result2': '스팸' if my_prediction2 == 'spam' else '햄', 'vocabs1' : json.dumps(l,indent=10), 'vocabs2' : json.dumps(l2,indent=10)})





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
        