from flask_restful import reqparse
from flask import request
from flask import Flask, jsonify
from sklearn.feature_extraction.text import CountVectorizer

import numpy as np
import pickle as p
import json
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
nltk.download('stopwords')
nltk.download('punkt')


app = Flask(__name__)


@app.route('/predict/', methods=['POST'])
def predict():
    vectorizer = CountVectorizer()
    if request.method == 'POST':
        data = request.get_json()
        #section = data['section']
        #value = data['value']
        value = data['email']
        
        vect = vectorizer.transform([value]).toarray()
        
        my_prediction = model.predict(vect)
        
    #return render_template('result.html',prediction = my_prediction)
    return jsonify({'result': '스팸' if my_prediction == 1 else '햄'})

if __name__ == '__main__':
    modelfile = './Multimodal-Spam-Filtering/spam-filtering-back/NB_classifier2.pickle'
    model = p.load(open(modelfile, 'rb'))
    app.run(debug=True)