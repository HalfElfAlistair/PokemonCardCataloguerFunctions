# Pokémon Card Cataloguer — Netlify Functions

A lightweight serverless API layer that safely connects the frontend to the external Pokémon TCGDex API. These functions validate auth, apply caching, and prevent misuse of the external API.

## Purpose

- Protect external API usage

- Validate Firebase auth before allowing requests

- Provide a stable interface for the frontend

- Add caching to reduce external API calls

External API used:

[https://api.tcgdex.net](https://api.tcgdex.net)

## Functions Overview

### get-cards-by-name

Searches the external API for all cards matching a given name.

#### Request

- Header: Authorization: <token>

- URL param: name=<searchTerm>

#### Response
Object keyed by card ID, each containing:

- id

- image

- localId

- name

### get-card-by-id

Fetches detailed data for a single card by ID.

#### Request

- Header: Authorization: <token>

- URL param: id=<cardId>

#### Response
Object keyed by card ID, containing full card details.

## Caching

- Both functions use simple in‑memory caching.

- Cache keys are card IDs.

- Name searches loop through cached entries to match by name.

## Local Development

### Install Netlify CLI if needed:

npm install -g netlify-cli

### Run locally:

npx netlify dev

## Environment Variables

FIREBASE_PROJECT_ID=\
FIREBASE_CLIENT_EMAIL=\
FIREBASE_PRIVATE_KEY=

These are used for verifying Firebase auth tokens.

## Deployment

- Auto‑deploys on push/merge to main

- Manual deploys possible via Netlify UI

- Includes a netlify.toml config file

