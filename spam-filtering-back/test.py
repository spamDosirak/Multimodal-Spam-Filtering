from flask import Flask,render_template,url_for,request
import pandas as pd 
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from flask import jsonify


app = Flask(__name__)

from flask import Flask, request

app = Flask(__name__)

@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.get_json()
    section = data['section']
    value = data['value']

    # 입력값에 대한 처리 로직 작성

    return jsonify({'message': 'Conversion successful'})


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
	
	# Extract Feature With CountVectorizer
	cv = CountVectorizer()
	X = cv.fit_transform(X) # Fit the Data
	from sklearn.model_selection import train_test_split
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
	#Naive Bayes Classifier
	from sklearn.naive_bayes import MultinomialNB

	clf = MultinomialNB()
	clf.fit(X_train,y_train)
	clf.score(X_test,y_test)
	#Alternative Usage of Saved Model
	# joblib.dump(clf, 'NB_spam_model.pkl')
	# NB_spam_model = open('NB_spam_model.pkl','rb')
	# clf = joblib.load(NB_spam_model)

	if request.method == 'POST':
		data = request.get_json()
		section = data['section']
		value = data['value']
		#message = request.form['message']
		#data = [message]
		vect = cv.transform([value]).toarray()
		
		my_prediction = clf.predict(vect)
	#return render_template('result.html',prediction = my_prediction)
	return jsonify({'result': '스팸' if my_prediction == 1 else '햄'})



if __name__ == '__main__':
        app.run(host='0.0.0.0', debug=True)