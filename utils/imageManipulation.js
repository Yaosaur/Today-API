//S3 account no longer active - Legacy code is no longer being used in project
//Methods used to upload and delete images in S3
// const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const ExpressError = require('./ExpressError');

// const s3 = new S3Client({
//   region: 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.S3_ACCESS_KEY,
//     secretAccessKey: process.env.S3_ACCESS_SECRET,
//   },
// });

// const fileUpload = (bucketName, key) =>
//   multer({
//     storage: multerS3({
//       s3,
//       bucket: bucketName,
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//       },
//       key: function (req, file, cb) {
//         cb(null, key);
//       },
//     }),
//   });

// const fileDelete = async (bucketName, location) => {
//   const params = {
//     Bucket: bucketName,
//     Key: location.split('/')[3],
//   };
//   try {
//     const data = await s3.send(new DeleteObjectCommand(params));
//     console.log('Success. Object deleted.', data);
//   } catch (err) {
//     throw new ExpressError();
//   }
// };

// module.exports = { fileUpload, fileDelete };
