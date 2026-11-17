# SoulSync 💗

**Find your person, at your pace.**
SoulSync is a dating app made with **React Native (Expo)** and our own **FastAPI** server, for **IT313 – Mobile Programming** at USTP-CDO.

## ⬇️ Download the app (Android)

Get the newest **SoulSync APK** from the [**Releases**](https://github.com/redeemer-xu/Dating_App_React_Native_Project/releases) page.

1. Download `SoulSync.apk` on your Android phone and install it (allow "Install unknown apps" if asked).
2. Someone must run the **SoulSync server** on a laptop (see [Run the server](#️-run-the-server)).
3. Connect your phone to the **same WiFi / hotspot** as that laptop.
4. Open SoulSync → tap **Server: … · Change** at the bottom of the Welcome screen → type the laptop's IP (for example `192.168.43.120`) → **Test & Save**.
5. Log in or create an account.

> The map needs internet on the phone (it loads OpenStreetMap tiles).

## ✨ Features

| Area | What you can do |
|---|---|
| Accounts | Register, log in, **stay logged in**, change password, delete account |
| Onboarding | Name, birthday, gender, Show Me, looking for, profile photo + 5 photos, interests, prompt |
| Verified badge | Take a **selfie with the front camera** → blue check on your profile |
| Discover | Swipe cards (like / nope), photo gallery, **search** by name or interest, filters: age, **distance (km)**, Show Me, verified only |
| Matches | New sparks, people who liked you, inbox with **unread badge** |
| Chat | Real messages between phones, **photos from gallery or camera**, **reactions** (❤️ 👍 😂 😮 😢 😡), "Seen", delete message, unmatch, block |
| Map | Native map (MapLibre + OpenStreetMap) with everyone's photo pins and your GPS location |
| Profile & Settings | Edit profile, **Dark / Light / System** theme, server address, sign out |

## 📚 IT313 tutorial topics used

| Topic | Where in SoulSync |
|---|---|
| Components, props, children | `Button`, `Avatar`, `SwipeDeck`, `MessageBubble`, `GradientBackground`, … |
| Context API | `AuthContext`, `ProfilesContext`, `MatchesContext`, `ChatContext`, `OnboardingContext`, `ThemeContext` |
| Expo Router (stack, tabs, dynamic routes) | Onboarding stack, 4 tabs, `profile/[id]`, `chat/[id]` |
| CRUD | Users, likes, blocks, messages, reactions |
| useEffect | Restore login, chat polling, unread checks, GPS |
| AsyncStorage | Stay logged in, saved theme, saved server address |
| Expo Location + Maps | `expo-location` (GPS, km distance) + Map tab |
| API: GET / POST / PUT / PATCH / DELETE | See [API endpoints](#-api-endpoints) |
| Own API with FastAPI | `server/main.py` (FastAPI + SQLite) |

## 🧰 Tech stack

- **App:** React Native, Expo SDK 57, Expo Router, React Compiler
- **Map:** `@maplibre/maplibre-react-native` with OpenFreeMap (OpenStreetMap data, no API key)
- **Device:** `expo-location`, `expo-image-picker` (gallery + camera), AsyncStorage
- **Server:** Python, FastAPI, Uvicorn, SQLite (`server/soulsync.db`)

## 🖥️ Run the server

**Windows (PowerShell)**
```powershell
cd server
python -m venv .venv            # first time only
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Linux**
```bash
cd server
python3 -m venv .venv           # first time only
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Open <http://localhost:8000/docs> to see and try every endpoint.
Find the laptop's IP with `ipconfig` (Windows) or `ip a` (Linux).

Team test accounts: `redeemer@gmail.com` / `123456`, `jastin@gmail.com` / `jastin123`, `jennifer@gmail.com` / `jennifer123`, `shenaiah@gmail.com` / `shenaiah123`, `tthrystan@gmail.com` / `tthrystan123`.

## 👩‍💻 Develop the app

```bash
npm install
npx expo start -c
```

Use the **SoulSync development build** (not Expo Go, which can't show the MapLibre map).
Build it with `eas build --profile development --platform android`.

Build the final APK with:
```bash
eas build --profile preview --platform android
```

## 🔌 API endpoints

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/register`, `/login` | Create account, log in |
| GET | `/users`, `/users/{id}` | Everyone / one profile |
| PATCH | `/users/{id}` | Change only some profile fields |
| PUT | `/users/{id}/interests` | Replace the whole interests list |
| POST | `/users/{id}/password` | Change password |
| POST | `/users/{id}/delete-account` | Delete account (needs password) |
| POST | `/upload-base64` | Upload a photo |
| GET / POST / DELETE | `/users/{id}/likes`, `/likes`, `/likes/{from}/{to}` | Likes and matches |
| GET / POST | `/users/{id}/blocks`, `/blocks` | Block / report |
| GET / POST / DELETE | `/messages`, `/messages/{id}` | Chat |
| POST | `/messages/read` | Mark as seen |
| POST / DELETE | `/messages/{id}/reactions`, `/messages/{id}/reactions/{user}` | Reactions |
| GET | `/users/{id}/inbox` | Conversations + unread counts |

## 👥 Team

- Redeemer Aparece
- Jastin Alberca
- Jennifer Barnido
- Shenaiah Elden
- Tthrystan Hortelano

Instructor: **Eimann Joshua Calderon** · IT313 Mobile Programming · USTP-CDO
