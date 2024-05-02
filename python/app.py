import json
from flask import Flask, jsonify
from twitter.scraper import Scraper

with open("cookies.json") as f:
    cookies = json.load(f)

new = {}
for cookie in cookies:
    new[cookie["name"]] = cookie["value"]

scraper = Scraper(cookies=new)

# Initialize Flask app
app = Flask(__name__)

# Define the endpoint to get followers


@app.route('/followers/<string:username>')
def get_followers(username):
    user = scraper.users([username])
    followers = user[0]["data"]["user"]["result"]["legacy"]["followers_count"]
    description = user[0]["data"]["user"]["result"]["legacy"]["description"]
    print(f'Followers for {username}: {followers}')
    return jsonify({"followers": followers, "description": description})


if __name__ == '__main__':
    app.run(debug=True)