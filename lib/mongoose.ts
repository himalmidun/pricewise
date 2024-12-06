import mongoose from "mongoose";

let isConnected = false; //variable to check connection status

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);
    mongoose.set('debug', true);

    if(!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');

    if(isConnected) return console.log('=> using existing database connection');

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });

        isConnected = true;

        console.log('MongoDB connected');
    } catch (error) {
        console.log(error)
    }
}