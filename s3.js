const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "us-east-2";
const BUCKET = process.env.S3_BUCKET;

const cliente = new S3Client({ region: REGION });

async function subirImagen(buffer, nombreArchivo, contentType) {
  if (!BUCKET) {
    throw new Error("Falta configurar S3_BUCKET en las variables de entorno");
  }

  await cliente.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: nombreArchivo,
      Body: buffer,
      ContentType: contentType
    })
  );

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${nombreArchivo}`;
}

module.exports = { subirImagen };
