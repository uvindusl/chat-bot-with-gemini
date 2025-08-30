const useVoiceToText = ({ continuous, lang }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = lang;
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = false;

    // Event handler for when a result is received
    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const newTranscript = event.results[last][0].transcript;
      setTranscript(newTranscript);
    };

    // Event handler for when the recognition service stops
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Event handler for errors
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    // Clean up on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, lang]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    startListening,
    stopListening,
    transcript,
    isListening,
    resetTranscript,
  };
};
