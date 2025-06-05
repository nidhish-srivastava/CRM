import prisma from "./prisma.js"

export const connectDb = async () => {
    try {
        console.log("Connected through prisma")
        await prisma.$connect()
    } catch (error) {
        return new Error(error.message)
    }
}