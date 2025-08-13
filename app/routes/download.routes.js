const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    const fileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1709559910/tests/${fileName}`;
    console.log('Attempting to download file from URL:', fileUrl);
    

    try {
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error downloading the file');
    }
});
router.get('/test/testing', (req, res) => {
    res.send('The download route is working');
});

module.exports = router;