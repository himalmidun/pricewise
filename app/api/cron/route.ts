import Product from "@/lib/models/product.model";
import Subscriber from "@/lib/models/subscriber.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/util";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        connectToDB();

        const products = await Product.find({});

        if (!products) throw new Error('No Products Found');

        const updateProducts = await Promise.all(products.map(async (currentProduct) => {
            const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

            if (!scrapedProduct) throw new Error('No Product found');

            const updatedPriceHistory = [
                ...currentProduct.priceHistory,
                { price: scrapedProduct.currentPrice }
            ];

            const product = {
                ...scrapedProduct,
                priceHstory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { url: product.url },
                product,
            )

            //check each product's status and send email accordingly
            const emailNotificationType = getEmailNotifType(scrapedProduct, currentProduct);

            if (emailNotificationType && updatedProduct.users.length > 0) {
                const ProductInfo = {
                    title: updatedProduct.title,
                    url: updatedProduct.url,
                }

                const emailContent = await generateEmailBody(ProductInfo, emailNotificationType);

                const userEmails = await Promise.all(updatedProduct.users.map(async (userId: any) => {
                    try {
                        const subscriber = await Subscriber.findById(userId);
                        if (!subscriber) throw new Error('subscriber not found');

                        await sendEmail(emailContent, userEmails, subscriber.refreshToken);
                    } catch (error) {
                        console.log(error);
                    }
                }));


            }
            return updatedProduct
        })
        );

        return NextResponse.json({
            message:'OK', data: updateProducts
        })
        

    } catch (error) {
        throw new Error(`Error in GET: ${error}`);
    }
}