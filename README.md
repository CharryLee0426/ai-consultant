# AI Consultant

## Description

Do you want an own consultant who can talk with you whenever you want? Try AI Consultant! You can build your own consultant living in incredible llama model.
Why is this app even better than OpenAI's ChatGPT? Because he/she has the real characteristic rather than OpenAI, a guy who knows everything but without emotion.
And, you don't need to worry about privacy problem because you can delete your data whenever you want.
What's more, it's free (this subscription page is a fake subscription). I create subscription function just in order to make this app more realistic.

## New Technologies in Project

1. clerk authentication
2. shadcn-ui
3. query string
4. planet scale
5. next cloudinary
6. ai
7. langchain
8. stripe
9. zustand

## How to use
If you want to use this app, please visit [here](https://ai-consultant-two.vercel.app/). It is an absolutely serverless project. So it's very efficient for startup developers.

## How to deploy the project from the source code

1. Git clone this project to your preferred location.

2. Enter this project, create `.env` file in root location.
    ```
    CLERK_SECRET_KEY=""
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
    NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
    NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

    DATABASE_URL=""
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

    PINECONE_INDEX=""
    PINECONE_ENVIRONMENT=""
    PINECONE_API_KEY=""

    UPSTASH_REDIS_REST_URL=""
    UPSTASH_REDIS_REST_TOKEN=""

    OPENAI_API_KEY=""

    STRIPE_API_KEY=""
    STRIPE_WEBHOOK_SECRET=""

    REPLICATE_API_KEY=""

    NEXT_PUBLIC_APP_URL=""
    ```
    Fill this file with your own keys. If you don't know what they are, just google it. Then enter their official websites and get api keys. All these services can link GitHub account.

3. Open terminal, enter the project root directory, and use `npm install` to install all dependencies. It can run on both x86 and arm64 architectures machines.

4. Use `npm run dev` to run this project. Use `http://localhost:3000/` to access your website if you run it locally.