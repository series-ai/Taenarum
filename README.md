# Taenarum
Portal for quick and silly games

## The Vision

Taenarum aims to be the **greatest mini-game portal ever created!** Leveraging the power and flexibility of TanStack libraries, this project will deliver a seamless, performant, and enjoyable experience for both players and developers. Get ready for a new era of web-based mini-games!

#### iOS Development Prerequisites

For iOS development with NativeScript, you'll need the following tools installed on your macOS machine:

0.  **Ruby and RubyGems:**
    *   **What it is:** Ruby is a programming language, and RubyGems (`gem` command) is its package manager. Tools like `xcodeproj` and `CocoaPods` are Ruby gems.
    *   **Installation & Setup:**
        *   macOS comes with a system version of Ruby, but it's generally **not recommended** for development due to permission issues and being outdated. It's best to install and manage Ruby using a version manager.
        *   **Using a Ruby Version Manager (Recommended):** Tools like `rbenv` (with `ruby-build`) or `RVM` allow you to install and switch between multiple Ruby versions easily. This is the most flexible and trouble-free approach.
            *   Install `rbenv` (e.g., via Homebrew: `brew install rbenv ruby-build`).
            *   This project specifies its Ruby version in the `.ruby-version` file. If you have a Ruby version manager installed, it should automatically pick up and use the version specified in this file (e.g., `3.2.2`). If you don't have that version installed, you can typically install it with your version manager (e.g., `rbenv install`).
            *   Set it as your global or local default (e.g., `rbenv global 3.2.2`).
        *   **Using Homebrew to install Ruby (Alternative):** You can also install Ruby directly via Homebrew (`brew install ruby`). Ensure your `PATH` is configured correctly to prioritize the Homebrew-installed Ruby over the system Ruby. Check Homebrew's output for specific `PATH` instructions.
        *   **Verify:** After setup, running `which ruby` should point to your managed Ruby installation (not `/usr/bin/ruby`), and `gem -v` should output the RubyGems version.

1.  **Xcode:**
    *   **What it is:** Xcode is Apple's integrated development environment (IDE) for macOS, used to develop software for macOS, iOS, iPadOS, watchOS, and tvOS. It includes the Xcode IDE, compilers, and the latest SDKs.
    *   **Installation:**
        *   The primary way to install Xcode is through the **Mac App Store**. Search for "Xcode" and install it.
        *   You may also need to install or update **Xcode Command Line Tools**. If you haven't installed them, you can often trigger the installation by running a command like `git` in the terminal, or by running:
            ```bash
            xcode-select --install
            ```
        *   Ensure Xcode is launched at least once to complete any necessary component installations.

2.  **xcodeproj:**
    *   **What it is:** A Ruby gem that allows you to create and modify Xcode projects from Ruby. It's often a dependency for other tools that interact with Xcode projects, including CocoaPods and sometimes NativeScript itself or its plugins.
    *   **Installation:** Open your terminal and run:
        ```bash
        sudo gem install xcodeproj
        ```
        *Note: Depending on your Ruby environment setup (e.g., if using rbenv or RVM), you might not need `sudo`.*

3.  **CocoaPods:**
    *   **What it is:** CocoaPods is a dependency manager for Swift and Objective-C Cocoa projects. NativeScript uses it to manage native iOS dependencies (Pods).
    *   **Installation:** Open your terminal and run:
        ```bash
        sudo gem install cocoapods
        ```
        *Note: Similar to xcodeproj, `sudo` might not be needed depending on your Ruby setup. If you use a Ruby version manager like rbenv or RVM, or if you've configured gems to install in your user directory, you can likely omit `sudo`.*
        *   After installation, you might also need to run `pod setup` once, although this is often handled automatically by tools like NativeScript when needed.

## Development Roadmap

Here's a high-level checklist to get the client and server up and running:

### Client-Side (Frontend)

- [x] **Project Setup:**
    - [x] Choose a frontend framework (e.g., React, Vue, Svelte, Solid). Chosen: NativeScript with React.
    - [x] Initialize the project with the chosen framework.
    - [ ] Install necessary TanStack libraries (e.g., TanStack Query, TanStack Table, TanStack Router).
    - [ ] Ensure chosen framework and libraries support responsive design for mobile-friendliness.
- [ ] **Core TanStack Integration:**
    - [ ] Set up TanStack Query for server state management.
    - [ ] Implement TanStack Router for navigation.
    - [ ] Consider TanStack Table for displaying leaderboards or game lists.
- [ ] **Basic UI/UX:**
    - [ ] Design a basic layout:
        - [ ] Implement a title screen with a "swipe up to start" gesture.
        - [ ] The title screen should transition to a game discovery/selection interface.
        - [ ] Design views for lobby, game selection (if different from discovery), and individual game play.
    - [ ] Implement user authentication (placeholder or basic).
    - [ ] Create initial UI components, ensuring they are touch-friendly and responsive for mobile devices.
    - [ ] Implement mouse swipe controls for the title screen interaction (for browser debugging).
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
