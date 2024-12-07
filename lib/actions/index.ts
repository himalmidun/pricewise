"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../util";
import mongoose from "mongoose";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { redirect } from "next/navigation";
import axios from "axios";
import Subscriber from "../models/subscriber.model";
import { User } from "@/types";



export async function scrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) return;

    try {
        await connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if (!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });

        if (existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate({ url: scrapedProduct.url }, product, { upsert: true, new: true });
        revalidatePath(`/products/${newProduct._id}`);

    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export async function getProductById(productId: string) {

    try {
        await connectToDB();

        const product = await Product.findOne({ _id: productId });

        if (!product) return null;

        return product;
    } catch (error) {

    }
}

export async function getAllProducts() {
    try {
        await connectToDB();

        const products = await Product.find({});
        console.log(`All products: ${products}`)
        return products;
    } catch (error) {
        console.log(error)
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        await connectToDB();

        const currentProduct = await Product.findById(productId);

        if (!currentProduct) return null;

        const similarProducts = await Product.find({
            _id: { $ne: productId },
        }).limit(3);

        return similarProducts;
    } catch (error) {
        console.log(error)
    }
}

export async function getUserAuthorization() {
    const authURL = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=https://mail.google.com/ http://mail.google.com/&access_type=offline&prompt=consent`;
    console.log('inside getAuthorization function');
    redirect(authURL);
}

export async function getAcessToken(code: string | null) {
    let accessToken = '';
    let refreshToken = '';
    if (code === null)
        return null;
    const params = {
        code: code || '', // The authorization code you received
        client_id: process.env.CLIENT_ID || '', // Your client ID
        client_secret: process.env.CLIENT_SECRET || '', // Your client secret
        redirect_uri: process.env.REDIRECT_URI || '', // Your redirect URI
        grant_type: 'authorization_code', // Grant type
        scope: 'https://www.googleapis.com/auth/gmail.send',
    };

    try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(params)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorBody}`);
        }
        const responseData = await response.json();

        accessToken = responseData?.access_token;
        refreshToken = responseData?.refresh_token;
        console.log('inside getAcessToken');
        console.log('Refresh Token: ', refreshToken);

    } catch (error) {
        console.log(error);
    }
    console.log('Access Token: ', accessToken);
    return { accessToken, refreshToken };
}

export async function fetchAccessTokenFromRefreshToken(refreshToken: string) {
    let accessToken = ''
    try {
        // URL to request the new access token from Google's OAuth 2.0 endpoint
        const tokenUrl = 'https://oauth2.googleapis.com/token';

        // Request payload
        const params = {
            client_id: process.env.CLIENT_ID || '', // Your client ID
            client_secret: process.env.CLIENT_SECRET || '', // Your client secret
            refresh_token: refreshToken,
            grant_type: 'refresh_token', // Grant type
            scope: 'https://www.googleapis.com/auth/gmail.send',
        };


        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(params)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorBody}`);
        }
        const responseData = await response.json();
        accessToken = responseData?.access_token;

        return accessToken;

    } catch (error) {
        console.log(error);
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string, accessToken: string, refreshToken: string) {
    try {
        const product = await Product.findById(productId);
        console.log('Product Info from addUserEmailToProduct is printed');
        if (!product) return;

        const subscriber = await Subscriber.findOne({ email: userEmail });

        if (subscriber) {
            const subscriberExists = product.users.some((subscriberId: string) => subscriberId === subscriber._id);
            if (!subscriberExists) {
                product.users.push(subscriber._id);
                await product.save({});
            }
        }

        if (!subscriber) {
            const newSubscriber = new Subscriber({
                email: userEmail,
                refreshToken: refreshToken,
            });
            // const newUser = await Subscriber.findOneAndUpdate({ }, newSubscriber, { upsert: true, new: true });
            // const newProduct = await Product.findOneAndUpdate({ url: scrapedProduct.url }, product, { upsert: true, new: true });
            const newUser = await Subscriber.findOneAndUpdate({ email: userEmail }, newSubscriber, { upsert: true, new: true });
            console.log('its good until here');
            product.users.push(newUser._id);
            console.log('New user id: ', newUser._id);
            await product.save();

            console.log('product saved successfully');
        }

        const emailContent = await generateEmailBody(product, "WELCOME");
        console.log('reached generate email');

        await sendEmail(emailContent, [userEmail], refreshToken, accessToken);

    } catch (error) {
        console.log('error in addUserEmailToProduct');
        console.log(error)
    }
}

// [
//     {imageUrl, alt}
//     {imageUrl, alt}
//     {imageUrl, alt}
// ]

//For carousel
export async function getProductImages(){
    try {
        const carouselImages: any = [];
        const products = await Product.find({});

        if(products.length == 0) return null;

        if(products.length > 5){
            const shuffled = products.sort(()=> Math.random() - 0.5);
            const fiveProducts = shuffled.slice(0,5);

            fiveProducts.forEach((product)=> {
                carouselImages.push({imgUrl: product.image, alt: product.title});
            })

            return carouselImages;
        }

        products.forEach((product)=> {
            carouselImages.push({imgUrl: product.image, alt: product.title});
        })
        return carouselImages;
    } catch (error) {
        console.log(error)
    }
}