import { useState, useEffect } from "react";
import {
  ref as storageRef,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { storage } from "../firebaseConfig";
import { ImageItem } from "../constants/Types";

export const useImages = (folderPath: string) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!folderPath) {
        setImages([]);
        return;
      }

      const folderRef = storageRef(storage, folderPath);
      const result = await listAll(folderRef);

      const imagePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);

        return {
          id: itemRef.name,
          name: itemRef.name,
          url,
          path: itemRef.fullPath,
          size: metadata.size,
          type: metadata.contentType || "image/jpeg",
          createdAt: metadata.timeCreated,
          updatedAt: metadata.updated,
        } as ImageItem;
      });

      const imagesList = await Promise.all(imagePromises);
      setImages(
        imagesList.sort(
          (a, b) =>
            new Date(b.updatedAt || "").getTime() -
            new Date(a.updatedAt || "").getTime()
        )
      );
    } catch (err) {
      console.error("Erro ao carregar imagens:", err);
      setError("Erro ao carregar imagens");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (
    file: File,
    fileName: string
  ): Promise<boolean> => {
    try {
      const imageRef = storageRef(storage, `${folderPath}/${fileName}`);
      await uploadBytes(imageRef, file);
      await loadImages(); // Recarregar lista
      return true;
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      return false;
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      const imageRef = storageRef(storage, imagePath);
      await deleteObject(imageRef);
      await loadImages(); // Recarregar lista
      return true;
    } catch (err) {
      console.error("Erro ao apagar imagem:", err);
      return false;
    }
  };

  useEffect(() => {
    loadImages();
  }, [folderPath]);

  return {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    refreshImages: loadImages,
  };
};
