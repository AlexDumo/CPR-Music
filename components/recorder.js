// with thanks to https://medium.com/front-end-weekly/recording-audio-in-mp3-using-reactjs-under-5-minutes-5e960defaf10

import MicRecorder from 'mic-recorder-to-mp3';
import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { FaMicrophone, FaStop, FaCloudUploadAlt, FaSpinner, FaTimesCircle, FaCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useRouter } from 'next/router';
import { UploadStatusEnum } from '../types';
import StatusIndicator from './statusIndicator';
import dynamic from 'next/dynamic'

// const WaveFormDisplay = dynamic(() => import('@/components/MusicPlayer/MusicPlayer'), {
//     ssr: false,
// })
// ...
// return(
// <MusicPlayer />
// )

export default function Recorder({ submit, accompaniment }) {
  // const Mp3Recorder = new MicRecorder({ bitRate: 128 }); // 128 is default already
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState('');
  const [blobData, setBlobData] = useState();
  const [blobInfo, setBlobInfo] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [recorder, setRecorder] = useState(new MicRecorder());
  const dispatch = useDispatch();
  const [min, setMinute] = useState(0);
  const [sec, setSecond] = useState(0);
  // const [waveSurfer, setWaveSurfer] = useWavesurfer(null);

  const accompanimentRef = useRef(null);

  const router = useRouter();
  const { slug, piece, actCategory, partType } = router.query;

  useEffect(() => {
    setBlobInfo([]);
    setBlobURL('');
    setBlobData();
  }, [partType]);

  const startRecording = (ev) => {
    // console.log('startRecording', ev);
    if (isBlocked) {
      console.error('cannot record, microphone permissions are blocked');
    } else {
      accompanimentRef.current.play();
      recorder
        .start()
        .then(setIsRecording(true))
        .catch((err) => console.error('problem starting recording', err));
    }
  };

  const stopRecording = (ev) => {
    // console.log('stopRecording', ev);
    accompanimentRef.current.pause();
    accompanimentRef.current.load();
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setBlobData(blob);
        const url = URL.createObjectURL(blob);
        setBlobURL(url);
        setBlobInfo([
          ...blobInfo,
          {
            url,
            data: blob,
          },
        ]);
        setIsRecording(false);
      })
      .catch((e) => console.error('error stopping recording', e));
  };

  const submitRecording = (i, submissionId) => {
    const formData = new FormData(); // TODO: make filename reflect assignment
    formData.append(
      'file',
      new File([blobInfo[i].data], 'student-recoding.mp3', {
        mimeType: 'audio/mpeg',
      })
    );
    // dispatch(submit({ audio: formData }));
    submit({ audio: formData, submissionId });
  };

  const superimposeAudio = (audioOneUrl, audioTwoUrl) => {
    console.log('superimposeAudio', audioOneUrl, audioTwoUrl);

    const audioCtx = new AudioContext();

    // Load first audio file
    const audio1 = new Audio(audioOneUrl.value);
    const source1 = audioCtx.createMediaElementSource(audio1);
    
    // Load second audio file
    const audio2 = new Audio(audioTwoUrl.value);
    const source2 = audioCtx.createMediaElementSource(audio2);
    
    // Create gain nodes to control volume
    const gainNode1 = audioCtx.createGain();
    const gainNode2 = audioCtx.createGain();
    
    // Connect sources to gain nodes
    source1.connect(gainNode1);
    source2.connect(gainNode2);
    
    // Connect gain nodes to the destination (output)
    gainNode1.connect(audioCtx.destination);
    gainNode2.connect(audioCtx.destination);
    
    // Set the initial gain value for each audio file
    gainNode1.gain.value = 0.5; // 50% volume
    gainNode2.gain.value = 0.5; // 50% volume
    
    // Start playback of both audio files
    audio1.play();
    audio2.play();
  };

  // useEffect(() => {
  //   if (blobData) {
  //     const ws = WaveSurfer.create({
  //       container: waveformRef.current,
  //       waveColor: 'violet',
  //       progressColor: 'purple',
  //       height: 100,
  //       barWidth: 2,
  //       responsive: true,
  //     });
  //     ws.loadBlob(blobData);
  //     setWaveSurfer(ws);
  //   }
  //   return () => {
  //     if (waveSurfer) {
  //       waveSurfer.destroy();
  //     }
  //   };
  // }, [blobData]);
  

  // check for recording permissions
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      navigator &&
      navigator.mediaDevices.getUserMedia
    ) {
      // console.log('navigator available');
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log('Permission Granted');
          setIsBlocked(false);
        })
        .catch(() => {
          console.log('Permission Denied');
          setIsBlocked(true);
        });
    }
  }, [isBlocked]);

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSecond(sec + 1);
        if (sec === 59) {
          setMinute(min + 1);
          setSecond(0);
        }
        if (min === 99) {
          setMinute(0);
          setSecond(0);
        }
      }, 1000);
    } else if (!isRecording && sec !== 0) {
      setMinute(0);
      setSecond(0);
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording, sec]);

  return (
    <>
      <Row>
        <Col>
          {!isBlocked ? (
            isRecording ? (
              <Button onClick={stopRecording}>
                <FaStop /> {String(min).padStart(2, '0')}:
                {String(sec).padStart(2, '0')}
              </Button>
            ) : (
              <Button onClick={startRecording}>
                <FaMicrophone />
              </Button>
            ))
            : (
              <p>Microphone Permissions Needed</p>
            )}
        </Col>
      </Row>
      <Row>
        <Col>
          {/* <StatusIndicator statusId={`recording-take-test`} /> */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={accompanimentRef}>
            <source src={accompaniment} type="audio/mpeg" />
          </audio>
          {blobInfo.length === 0 ? (
            <span>
              No takes yet.
              {!isBlocked ?
                (" Click the microphone icon to record.") :
                (" Microphone permissions are needed to record.")
              }
            </span>
          ) : (
            <ListGroup as="ol" numbered>
              {blobInfo.length === 2 && superimposeAudio(blobInfo[0].url, blobInfo[1].url)}
              {blobInfo.map((take, i) => (
                <ListGroupItem
                  key={take.url}
                  as="li"
                  className="d-flex justify-content-between align-items-start"
                  style={{ fontSize: '1.5rem' }}
                >
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio
                    style={{ height: '2.25rem' }}
                    src={take.url}
                    controls
                  />
                  {/* <div className='waveform' ref={waveFormRef} /> */}
                  <Button
                    onClick={() => submitRecording(i, `recording-take-${i}`)}
                  >
                    <FaCloudUploadAlt />
                  </Button>
                  <div className="minWidth">
                    <StatusIndicator statusId={`recording-take-${i}`} />
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={blobURL} />
        </Col>
      </Row>
    </>
  );
}
