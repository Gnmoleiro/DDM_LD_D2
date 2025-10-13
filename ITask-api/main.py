from flask import Flask, render_template, request, redirect, url_for, flash, session, abort
from models import db

from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///itask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'chave'

db.init_app(app)


@app.route("/")
def index():
    return "AAAAAAAAAAAAAAAA"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
