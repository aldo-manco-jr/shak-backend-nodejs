import cv2
import numpy as np
import face_recognition
import os
import sys
import urllib
from datetime import datetime
from urllib import request

def findFacesEncodings(imagesList):

    facesListEncodingsList = []

    for image in imagesList:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        faceEncodingsList = face_recognition.face_encodings(image)[0]
        facesListEncodingsList.append(faceEncodingsList)
    return facesListEncodingsList

def getUserByFace():

    URL = "https://res.cloudinary.com/dfn8llckr/image/upload/v1601987890/hsv9jhg9wm78ttrtgspx.jpg"

    f = open('photo_to_analyze.jpg', 'wb')
    f.write(request.urlopen(URL).read())
    f.close()

    pathImagesList = 'images-attendance'

    imagesList = []

    namesFacesList = []

    filenameImagesList = os.listdir(pathImagesList)
    filenameImagesList.pop()

    print(filenameImagesList)

    for filenameImage in filenameImagesList:
        currentImage = cv2.imread(f'{pathImagesList}/{filenameImage}')
        imagesList.append(currentImage)
        namesFacesList.append(os.path.splitext(filenameImage)[0])

    facesListEncodingsList = findFacesEncodings(imagesList)
    print('Encoding Complete')

    image = face_recognition.load_image_file('photo_to_analyze.jpg')
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    imageFaceLocationsList = face_recognition.face_locations(image)

    imageFaceEncodingsList = face_recognition.face_encodings(image, imageFaceLocationsList)

    imageFacesLocationsEncodings = zip(imageFaceEncodingsList, imageFaceLocationsList)

    for currentImageFaceEncodings, currentImageFaceLocation in imageFacesLocationsEncodings:

        facesMatches = face_recognition.compare_faces(facesListEncodingsList, currentImageFaceEncodings)

        facesDistances = face_recognition.face_distance(facesListEncodingsList, currentImageFaceEncodings)

        print(facesMatches)
        print(f"{facesDistances}\n")

        bestMatchIndex = np.argmin(facesDistances)

        if facesMatches[bestMatchIndex]:

            bestMatchPersonName = namesFacesList[bestMatchIndex].upper()
            print(bestMatchPersonName)

            Y1, X2, Y2, X1 = currentImageFaceLocation

            cv2.rectangle(image,
                          (X1, Y1),
                          (X2, Y2),
                          (0, 67, 23),
                          2)

            cv2.rectangle(image,
                          (X1, Y2-35),
                          (X2, Y2),
                          (0, 67, 23),
                          cv2.FILLED)

            cv2.putText(image,
                        bestMatchPersonName,
                        (X1+6, Y2-6),
                        cv2.FONT_HERSHEY_COMPLEX,
                        1,
                        (255, 255, 255),
                        2)

            print(bestMatchPersonName)
            sys.stdout.flush()
            return bestMatchPersonName

username = getUserByFace()
print(username)
