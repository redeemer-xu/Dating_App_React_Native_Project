"""
SoulSync API (our own server, made with Python FastAPI)

Run it (inside the server folder):
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Open http://localhost:8000/docs in a browser to see and try every endpoint.

Everything is saved in soulsync.db (SQLite = a database inside one file).
Uploaded photos are saved in the uploads folder.
"""

import hashlib
import json
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

HERE = Path(__file__).parent
DB_FILE = HERE / "soulsync.db"
UPLOADS = HERE / "uploads"
TEAM_PHOTOS = HERE.parent / "assets" / "team"  # the same photos the app already has

UPLOADS.mkdir(exist_ok=True)

app = FastAPI(title="SoulSync API")

# Let the app (and the web version) call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Photos are served as files: /uploads/abc.jpg and /team/jastin.jpg
app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")
if TEAM_PHOTOS.exists():
    app.mount("/team", StaticFiles(directory=TEAM_PHOTOS), name="team")


# ---------------------------------------------------------------- database


def db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def hash_password(password: str) -> str:
    # never save the real password, only a scrambled version of it
    return hashlib.sha256(("soulsync:" + password).encode()).hexdigest()


# What a brand-new user looks like before onboarding
DEFAULT_PROFILE = {
    "name": None,
    "age": None,
    "gender": None,
    "birthday": None,
    "showMe": "Everyone",
    "lookingFor": [],
    "title": "New on SoulSync",
    "location": "Cagayan de Oro, PH",
    "distance": "1 mile away",
    "bio": "New to SoulSync. Say hi!",
    "avatar": None,  # profile picture
    "photos": [],  # up to 5 extra photos
    "tags": [],  # interests
    "prompts": [],
    "verified": False,
    "onboarded": False,  # True after the 3 onboarding steps
}

# Our group mates (added the first time the server starts)
TEAM = [
    (
        "redeemer",
        "redeemer@gmail.com",
        "123456",
        {
            "name": "Redeemer",
            "age": 22,
            "gender": "Man",
            "distance": "1 mile away",
            "avatar": "/team/redeemer.jpg",
            "tags": ["Coding", "Coffee", "Gaming"],
            "bio": "Group creator and part-time bug hunter. Fueled by coffee and one more console.log.",
            "prompts": [
                {
                    "question": "A perfect Sunday looks like",
                    "answer": "Zero errors in the terminal and a very long nap.",
                }
            ],
        },
    ),
    (
        "jastin",
        "jastin@gmail.com",
        "jastin123",
        {
            "name": "Jastin",
            "age": 23,
            "gender": "Man",
            "distance": "2 miles away",
            "avatar": "/team/jastin.jpg",
            "tags": ["Tech", "Music", "Late Night"],
            "bio": "Code by day, snacks by night. Ask me about my git commits (I will say 'fix').",
            "prompts": [
                {
                    "question": "My most controversial opinion",
                    "answer": "Tabs are better than spaces, fight me.",
                }
            ],
        },
    ),
    (
        "jennifer",
        "jennifer@gmail.com",
        "jennifer123",
        {
            "name": "Jennifer",
            "age": 22,
            "gender": "Woman",
            "distance": "3 miles away",
            "avatar": "/team/barnedo.jpg",
            "tags": ["Design", "Movies", "Coffee"],
            "bio": "Professional deadline survivor. Will trade my notes for good conversation.",
            "prompts": [
                {
                    "question": "I'll know it's a match when",
                    "answer": "You also say 'five more minutes' and mean it.",
                }
            ],
        },
    ),
    (
        "shenaiah",
        "shenaiah@gmail.com",
        "shenaiah123",
        {
            "name": "Shenaiah",
            "age": 24,
            "gender": "Woman",
            "distance": "4 miles away",
            "avatar": "/team/sabana.jpg",
            "tags": ["Travel", "Photography", "Music"],
            "bio": "Here for the good vibes and the group projects that somehow work out.",
            "prompts": [
                {
                    "question": "The best way to win me over is",
                    "answer": "Bring snacks to our group meeting.",
                }
            ],
        },
    ),
    (
        "tthrystan",
        "tthrystan@gmail.com",
        "tthrystan123",
        {
            "name": "Tthrystan",
            "age": 23,
            "gender": "Man",
            "distance": "5 miles away",
            "avatar": "/team/amomas.jpeg",
            "tags": ["Gaming", "Tech", "Fitness"],
            "bio": "Calm on the outside, debugging on the inside. Always down for a quick game after class.",
            "prompts": [
                {
                    "question": "Together we could",
                    "answer": "Win the group project and the late-night game.",
                }
            ],
        },
    ),
]


def setup_database():
    with db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                profile TEXT NOT NULL            -- all profile fields as JSON
            );
            CREATE TABLE IF NOT EXISTS likes (
                from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                PRIMARY KEY (from_id, to_id)
            );
            CREATE TABLE IF NOT EXISTS blocks (
                from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                PRIMARY KEY (from_id, to_id)
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        empty = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0
        if empty:
            for username, email, password, fields in TEAM:
                profile = {
                    **DEFAULT_PROFILE,
                    "title": "BSIT Student",
                    **fields,
                    "onboarded": True,
                }
                conn.execute(
                    "INSERT INTO users (username, email, password_hash, profile) VALUES (?, ?, ?, ?)",
                    (username, email, hash_password(password), json.dumps(profile)),
                )


setup_database()


def to_json(row) -> dict:
    """A user row from the database -> the JSON the app gets (no password)."""
    profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
    images = [p for p in [profile["avatar"], *profile["photos"]] if p]
    return {
        "id": str(row["id"]),
        "username": row["username"],
        "email": row["email"],
        **profile,
        "images": images,  # profile picture first, then the extra photos
    }


def get_user_row(conn, user_id):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return row


# ---------------------------------------------------------------- request bodies


class RegisterBody(BaseModel):
    username: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class PairBody(BaseModel):
    from_id: int
    to_id: int


class MessageBody(BaseModel):
    sender_id: int
    receiver_id: int
    text: str


# Fields the app is allowed to change with PATCH /users/{id}
EDITABLE = set(DEFAULT_PROFILE.keys())


# ---------------------------------------------------------------- endpoints


@app.get("/")
def home():
    return {"message": "SoulSync API is running. Open /docs to try it."}


# ---- accounts


@app.post("/register", status_code=201)
def register(body: RegisterBody):
    email = body.email.strip().lower()
    with db() as conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(
                status_code=409, detail="An account with this email already exists."
            )
        cursor = conn.execute(
            "INSERT INTO users (username, email, password_hash, profile) VALUES (?, ?, ?, ?)",
            (
                body.username.strip(),
                email,
                hash_password(body.password),
                json.dumps(DEFAULT_PROFILE),
            ),
        )
        return to_json(get_user_row(conn, cursor.lastrowid))


@app.post("/login")
def login(body: LoginBody):
    with db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? AND password_hash = ?",
            (body.email.strip().lower(), hash_password(body.password)),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        return to_json(row)


# ---- users (CRUD)


@app.get("/users")
def list_users():
    """Everyone who finished onboarding (the app hides you and blocked people)."""
    with db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY id").fetchall()
        return [user for user in map(to_json, rows) if user["onboarded"]]


@app.get("/users/{user_id}")
def get_user(user_id: int):
    with db() as conn:
        return to_json(get_user_row(conn, user_id))


@app.patch("/users/{user_id}")
def update_user(user_id: int, changes: dict):
    with db() as conn:
        row = get_user_row(conn, user_id)
        profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
        for key, value in changes.items():
            if key in EDITABLE:
                profile[key] = value
        profile["photos"] = (profile["photos"] or [])[:5]  # max 5 extra photos
        conn.execute(
            "UPDATE users SET profile = ? WHERE id = ?", (json.dumps(profile), user_id)
        )
        return to_json(get_user_row(conn, user_id))


@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    """Delete account: likes, blocks and messages are removed too (ON DELETE CASCADE)."""
    with db() as conn:
        get_user_row(conn, user_id)
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return {"deleted": True, "id": str(user_id)}


# ---- photos


@app.post("/upload", status_code=201)
async def upload_photo(file: UploadFile = File(...)):
    ext = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".heic"}:
        ext = ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    (UPLOADS / name).write_bytes(await file.read())
    return {"url": f"/uploads/{name}"}


# ---- likes


@app.get("/users/{user_id}/likes")
def get_likes(user_id: int):
    """liked = people I liked, likedBy = people who liked me."""
    with db() as conn:
        liked = [
            str(r[0])
            for r in conn.execute(
                "SELECT to_id FROM likes WHERE from_id = ?", (user_id,)
            )
        ]
        liked_by = [
            str(r[0])
            for r in conn.execute(
                "SELECT from_id FROM likes WHERE to_id = ?", (user_id,)
            )
        ]
        return {"liked": liked, "likedBy": liked_by}


@app.post("/likes", status_code=201)
def add_like(body: PairBody):
    with db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO likes (from_id, to_id) VALUES (?, ?)",
            (body.from_id, body.to_id),
        )
        return {"from_id": str(body.from_id), "to_id": str(body.to_id)}


@app.delete("/likes/{from_id}/{to_id}")
def remove_like(from_id: int, to_id: int):
    with db() as conn:
        conn.execute(
            "DELETE FROM likes WHERE from_id = ? AND to_id = ?", (from_id, to_id)
        )
        return {"deleted": True}


# ---- blocks


@app.get("/users/{user_id}/blocks")
def get_blocks(user_id: int):
    """hidden = people I blocked + people who blocked me."""
    with db() as conn:
        rows = conn.execute(
            "SELECT to_id FROM blocks WHERE from_id = ? UNION SELECT from_id FROM blocks WHERE to_id = ?",
            (user_id, user_id),
        )
        return {"hidden": [str(r[0]) for r in rows]}


@app.post("/blocks", status_code=201)
def block_user(body: PairBody):
    with db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO blocks (from_id, to_id) VALUES (?, ?)",
            (body.from_id, body.to_id),
        )
        conn.execute(
            "DELETE FROM likes WHERE from_id = ? AND to_id = ?",
            (body.from_id, body.to_id),
        )
        return {"from_id": str(body.from_id), "to_id": str(body.to_id)}


# ---- messages


def message_json(row) -> dict:
    created = datetime.fromisoformat(row["created_at"])
    return {
        "id": str(row["id"]),
        "senderId": str(row["sender_id"]),
        "receiverId": str(row["receiver_id"]),
        "text": row["text"],
        "createdAt": row["created_at"],
        "time": created.strftime("%I:%M %p").lstrip("0"),  # "3:07 PM"
    }


@app.get("/messages")
def get_messages(user_a: int, user_b: int):
    """The conversation between two people, oldest first."""
    with db() as conn:
        rows = conn.execute(
            """SELECT * FROM messages
               WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
               ORDER BY id""",
            (user_a, user_b, user_b, user_a),
        ).fetchall()
        return [message_json(r) for r in rows]


@app.post("/messages", status_code=201)
def send_message(body: MessageBody):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message is empty.")
    with db() as conn:
        get_user_row(conn, body.receiver_id)
        cursor = conn.execute(
            "INSERT INTO messages (sender_id, receiver_id, text, created_at) VALUES (?, ?, ?, ?)",
            (
                body.sender_id,
                body.receiver_id,
                text,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )
        row = conn.execute(
            "SELECT * FROM messages WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return message_json(row)


@app.delete("/messages/{message_id}")
def delete_message(message_id: int):
    with db() as conn:
        conn.execute("DELETE FROM messages WHERE id = ?", (message_id,))
        return {"deleted": True, "id": str(message_id)}


@app.get("/users/{user_id}/inbox")
def get_inbox(user_id: int):
    """One item per person I have messages with: the newest message, newest first."""
    with db() as conn:
        rows = conn.execute(
            """SELECT * FROM messages WHERE id IN (
                   SELECT MAX(id) FROM messages
                   WHERE sender_id = ? OR receiver_id = ?
                   GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
               ) ORDER BY id DESC""",
            (user_id, user_id, user_id),
        ).fetchall()
        inbox = []
        for row in rows:
            other = (
                row["receiver_id"] if row["sender_id"] == user_id else row["sender_id"]
            )
            inbox.append({"otherId": str(other), "lastMessage": message_json(row)})
        return inbox
