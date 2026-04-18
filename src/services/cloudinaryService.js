const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/TU_CLOUD_NAME/image/upload';
const UPLOAD_PRESET = 'golpe_de_suerte_preset';

/**
 * Sube una imagen a Cloudinary y retorna la URL segura.
 */
const uploadImage = async (uri) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        });
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            console.error('Error Cloudinary:', data);
            return null;
        }
    } catch (error) {
        console.error('Error al subir imagen:', error);
        return null;
    }
};

export default { uploadImage };
