import asyncio
import websockets
import json

#Machine Vision libraries
import cv2
import mediapipe as mp
mp_drawing = mp.solutions.drawing_utils
mp_holistic = mp.solutions.holistic

# Handle WebSocket connection
async def handle_ws(websocket, path):
    # recv = await websocket.recv()
    # recv = json.loads(recv)

    # Get Wecam input
    cap = cv2.VideoCapture(0)
    with mp_holistic.Holistic( min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                # If loading a video, use 'break' instead of 'continue'.
                continue

            # Flip the image horizontally for a later selfie-view display, and convert
            # the BGR image to RGB.
            image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
            # To improve performance, optionally mark the image as not writeable to
            # pass by reference.
            image.flags.writeable = False
            results = holistic.process(image)

            # Draw landmark annotation on the image.
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            mp_drawing.draw_landmarks(
                image, results.face_landmarks, mp_holistic.FACE_CONNECTIONS)
            mp_drawing.draw_landmarks(
                image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            mp_drawing.draw_landmarks(
                image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            mp_drawing.draw_landmarks(
                image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)

            if not results.pose_landmarks:
                continue

            # print(results.pose_landmarks.landmark)
            # print(results.pose_landmark[mp_holistic.FACE_CONNECTIONS])
            pose =[]
            for landmark in results.pose_landmarks.landmark:
                print(landmark)
                pose.append({
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "v": landmark.visibility
                })
            try:
                await websocket.send(json.dumps({"pose":pose}))
            
            except ValueError:
                print("error with webocket..")
                break;
            
            cv2.imshow('MediaPipe Holistic', image)
            if cv2.waitKey(5) & 0xFF == 27:
                break
        cap.release()

    # await websocket.send("hello")
        

if __name__ == '__main__':
    PORT = 8765
    print(f"starting WebSocket server at port:{PORT}")
    server = websockets.serve(handle_ws, '0.0.0.0', PORT)
    # capturePose()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(server)
    loop.run_forever()
