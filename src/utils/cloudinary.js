import {v2 as cloudinary}   from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnClodinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        const result = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        });
        //file has been uploaded on cloudinary
        log("File uploaded successfully on cloudinary", result.url);
        return result;
    }
    catch (error) {
        fs.unlinkSync(localFilePath); // remove the locallay saved temmpory file as the upload opertaion failed
        console.log(error);
    }
}

export {uploadOnClodinary};
// import { v2 as cloudinary } from 'cloudinary';

// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: 'dknfns76b', 
//         api_key: '131384262892199', 
//         api_secret: '<your_api_secret>' // Click 'View Credentials' below to copy your API secret
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();