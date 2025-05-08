# Taenarum
Portal for quick and silly games

## The Vision

Taenarum aims to be the **greatest mini-game portal ever created!** Leveraging the power and flexibility of TanStack libraries, this project will deliver a seamless, performant, and enjoyable experience for both players and developers. Get ready for a new era of web-based mini-games!

## Development Roadmap

Here's a high-level checklist to get the client and server up and running:

### Client-Side (Frontend)

- [ ] **Project Setup:**
    - [ ] Choose a frontend framework (e.g., React, Vue, Svelte, Solid).
    - [ ] Initialize the project with the chosen framework.
    - [ ] Install necessary TanStack libraries (e.g., TanStack Query, TanStack Table, TanStack Router).
- [ ] **Core TanStack Integration:**
    - [ ] Set up TanStack Query for server state management.
    - [ ] Implement TanStack Router for navigation.
    - [ ] Consider TanStack Table for displaying leaderboards or game lists.
- [ ] **Basic UI/UX:**
    - [ ] Design a basic layout for the portal (lobby, game selection, game view).
    - [ ] Implement user authentication (placeholder or basic).
    - [ ] Create initial UI components.
- [ ] **First Game Integration (Placeholder):**
    - [ ] Develop a very simple game stub to test client-server communication.

### Server-Side (Backend)

- [ ] **Project Setup:**
    - [ ] Choose a backend language/framework (e.g., Node.js with Express, Python with Flask/Django, Go, Rust).
    - [ ] Initialize the server project.
    - [ ] Select and set up a database (e.g., PostgreSQL, MongoDB, SQLite for development).
- [ ] **API Development - Multiplayer:**
    - [ ] Design WebSocket or real-time communication strategy for game state synchronization.
    - [ ] Implement basic matchmaking or room creation logic.
    - [ ] Develop APIs for game actions and events.
- [ ] **API Development - Leaderboards & User Management:**
    - [ ] Design database schema for users, game scores, and leaderboards.
    - [ ] Implement CRUD APIs for user profiles.
    - [ ] Implement APIs to submit scores and retrieve leaderboards.
    - [ ] Implement authentication and authorization.
- [ ] **Persistence:**
    - [ ] Ensure game state can be saved and resumed if applicable.
    - [ ] Store user data and scores reliably.

### Initial Game Development

- [ ] **Game 1 - Concept & Design:**
    - [ ] Define rules and mechanics for the first playable mini-game.
- [ ] **Game 1 - Implementation:**
    - [ ] Develop the client-side logic for the game.
    - [ ] Develop the server-side logic for the game (if multiplayer).

### Deployment & Operations

- [ ] **Client Deployment:**
    - [ ] Choose a hosting platform (e.g., Vercel, Netlify, AWS S3/CloudFront).
    - [ ] Set up CI/CD pipeline for the client.
- [ ] **Server Deployment:**
    - [ ] Choose a hosting platform (e.g., Heroku, AWS EC2/ECS, Google Cloud Run, DigitalOcean).
    - [ ] Set up CI/CD pipeline for the server.
- [ ] **Monitoring & Logging:**
    - [ ] Implement basic logging on the server.
    - [ ] Set up monitoring tools if necessary.

This checklist provides a starting point. Feel free to adapt and expand it as the project evolves!
