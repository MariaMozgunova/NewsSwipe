from __future__ import absolute_import
from __future__ import division, print_function, unicode_literals

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
load_dotenv()  # This loads the variables from the .env file

app = Flask(__name__)

# Allow CORS for all routes
CORS(app)

# with open('test.txt', encoding='utf-8') as f:
    # content = f.read()


LANGUAGE = "english"

def summarize_text(content, sentences=3):
    parser = PlaintextParser.from_string(content, Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)

    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    result = []
    for sentence in summarizer(parser.document, sentences):
        result.append(str(sentence))
    
    return ' '.join(result)

@app.route('/retrieve-summarized-news', methods=['POST'])
def process_text():
    url = request.json['url_without_key']
    url += f'&apikey={os.getenv("NEWS_API_KEY")}'
    print(url)
    response = requests.get(url)

    if not response.ok:
        return jsonify([])
    
    response = response.json()["results"]
    news_articles = []

    for news in response:
        content = news["content"]
        if len(content) > 300:
            content = summarize_text(content)
        news_articles.append([news["title"], news["image_url"], content])
    
    # Return the processed data as JSON
    result = {"data": news_articles}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=bool(int(os.getenv("DEBUG"))))
