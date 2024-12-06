import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractPrice } from "../util";
import { Average } from "next/font/google";
export async function scrapeAmazonProduct(url:string) {
    if(!url) return;

    //Bright Data proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 33335;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth:{
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);
        
        //Extract product titile
        const title = $('#productTitle').text();
        const currentPrice  = extractPrice(
            // $('.priceToPay span.a-price-whole'),
            // $('a.size.base.a-color-price'),
            // $('.a-button-selected .a-color-base'),
            // $('span.a-price.a-text-price.a-size-medium.apexPriceToPay'),
            $('.apexPriceToPay')
        );
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('td.a-span12.a-color-secondary.a-size-base span.a-offscreen')
        );
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currenty unavailable';
        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}';

        const imageUrls = Object.keys(JSON.parse(images))

        const currency = extractCurrency($('.a-price-symbol'))

        // const discountRate = $('td.a-span12.a-color-price.a-size-base span.a-color-price').text().replace(/[-%]/g,"");
        const discountRate = $('td.a-span12.a-color-price.a-size-base span.a-color-price').text().replace(/^.*?\((\d+%)\).*$/, "$1");

        // console.log(title, currentPrice, originalPrice,outOfStock, imageUrls, currency, discountRate)

        //construct data object with scraped information
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate.slice(0,-1)),
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description: 'description add later',
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }
        
        // console.log(data);
        return data;

    } catch (error: any) {
        console.log(error)
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}