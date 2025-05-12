const audioConfig = [
  {
    userName: '灵珑',
    data: {
      model: 'speech-02-hd',
      text: '',
      timber_weights: [
        {
          voice_id: 'Chinese (Mandarin)_Laid_BackGirl',
          weight: 1,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: 1.25,
        pitch: 0,
        vol: 1.25,
        emotion: 'disgusted',
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'auto',
    },
  },
  {
    userName: '沈初见',
    data: {
      model: 'speech-02-turbo',
      text: '',
      timber_weights: [
        {
          voice_id: 'Chinese (Mandarin)_Warm_HeartedGirl',
          weight: 1,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: 1.25,
        pitch: 0,
        vol: 1.25,
        emotion: 'happy',
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'auto',
    },
  },
  {
    userName: '江浩',
    data: {
      model: 'speech-01-turbo',
      text: '',
      timber_weights: [
        {
          voice_id: 'male-qn-badao',
          weight: 1,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: 1.25,
        pitch: 0,
        vol: 1.25,
        emotion: 'angry',
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'auto',
    },
  },
  {
    userName: '苏瑶',
    data: {
      model: 'speech-02-hd',
      text: '',
      timber_weights: [
        {
          voice_id: 'Chinese (Mandarin)_Mature_Woman',
          weight: 1,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: 1.25,
        pitch: 0,
        vol: 1,
        emotion: 'disgusted',
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'auto',
    },
  },
  {
    userName: '沈初云',
    data: {
      model: 'speech-02-hd',
      text: '',
      timber_weights: [
        {
          voice_id: 'Chinese (Mandarin)_Warm_HeartedGirl',
          weight: 1,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: 1,
        pitch: 0,
        vol: 1,
        emotion: 'happy',
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'auto',
    },
  },
]
export default audioConfig
