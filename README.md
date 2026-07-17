
  # Luxury E-commerce Jewelry Website

  This is a code bundle for Luxury E-commerce Jewelry Website. The original project is available at https://www.figma.com/design/IM84h5lKl7wF6MKQzgabKA/Luxury-E-commerce-Jewelry-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend configuration

  Copy `.env.example` to `.env.local` and configure the Mini backend URL. The storefront currently uses backend app `19` for integration testing:

  ```env
  VITE_API_BASE_URL=http://127.0.0.1:8080/api
  VITE_SHOP_APP_ID=19
  VITE_PAYMENT_PROVIDER=idram
  ```
  
