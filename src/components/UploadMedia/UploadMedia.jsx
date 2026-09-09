import {
  useRef,
  useState
}
from "react";

import "./UploadMedia.css";


export default function UploadMedia({
  onUpload,
  disabled = false
}) {


  const inputRef =
    useRef(null);


  const [
    uploading,
    setUploading
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");



  const getDuration = (
    file
  ) => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const url =
          URL.createObjectURL(
            file
          );


        const element =
          file.type.startsWith(
            "video/"
          )
          ?
          document.createElement(
            "video"
          )
          :
          document.createElement(
            "audio"
          );


        element.preload =
          "metadata";


        element.onloadedmetadata =
          () => {

            const duration =
              element.duration;


            URL.revokeObjectURL(
              url
            );


            resolve(
              duration
            );

          };


        element.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );


            reject(
              new Error(
                "Could not read media duration."
              )
            );

          };


        element.src =
          url;

      }
    );

  };



  const validateFile = async (
    file
  ) => {


    const supported =
      (
        file.type.startsWith(
          "image/"
        )
        ||
        file.type.startsWith(
          "video/"
        )
        ||
        file.type.startsWith(
          "audio/"
        )
      );


    if (!supported) {

      throw new Error(
        "Only photos, GIFs, video and audio are supported."
      );

    }



    if (
      file.type.startsWith(
        "video/"
      )
      ||
      file.type.startsWith(
        "audio/"
      )
    ) {

      const duration =
        await getDuration(
          file
        );


      if (
        duration > 60
      ) {

        throw new Error(
          "Video and audio files must be 60 seconds or shorter."
        );

      }

    }

  };



  const handleFileChange =
    async event => {


      const file =
        event.target.files?.[0];


      event.target.value =
        "";


      if (!file) {
        return;
      }


      setError("");


      try {

        setUploading(
          true
        );


        await validateFile(
          file
        );


        await onUpload(
          file
        );

      }

      catch (
        uploadError
      ) {

        console.error(
          uploadError
        );


        setError(
          uploadError.message ||
          "Upload failed."
        );

      }

      finally {

        setUploading(
          false
        );

      }

    };



  return (

    <div className="upload-media">

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={
          handleFileChange
        }
        hidden
      />


      <button
        type="button"
        className="upload-media-button"
        disabled={
          disabled ||
          uploading
        }
        onClick={() =>
          inputRef.current?.click()
        }
      >

        {
          uploading
          ?
          "Adding..."
          :
          "＋ Add Media"
        }

      </button>


      <p className="upload-media-help">

        Photos, GIFs and up to
        1-minute video/audio clips.

      </p>


      {
        error && (

          <p className="upload-media-error">
            {error}
          </p>

        )
      }

    </div>

  );

}