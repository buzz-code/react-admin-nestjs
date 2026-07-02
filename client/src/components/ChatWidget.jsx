import { useState } from 'react';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

import { apiUrl } from '@shared/providers/constantsProvider';
import { fetchJson } from '@shared/utils/httpUtil';

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        const trimmed = question.trim();
        if (!trimmed || loading) {
            return;
        }
        setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
        setQuestion('');
        setLoading(true);
        try {
            const response = await fetchJson(`${apiUrl}/llm-assistant/ask`, {
                method: 'POST',
                body: JSON.stringify({ question: trimmed }),
                headers: new Headers({ 'Content-Type': 'application/json' }),
            });
            setMessages((prev) => [...prev, { role: 'assistant', text: response.json.answer }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'אירעה שגיאה, נסו שוב מאוחר יותר.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1300 }}>
            {open && (
                <Paper
                    elevation={4}
                    sx={{ width: 340, height: 440, mb: 1, display: 'flex', flexDirection: 'column' }}
                >
                    <Box sx={{ p: 1.5, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">עוזר תמיכה</Typography>
                        <IconButton size="small" onClick={() => setOpen(false)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                        {messages.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                שאלו אותי שאלה על המערכת, למשל "למה אין כיתה בתעודה?"
                            </Typography>
                        )}
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    textAlign: message.role === 'user' ? 'left' : 'right',
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        display: 'inline-block',
                                        bgcolor: message.role === 'user' ? 'grey.200' : 'primary.light',
                                        color: message.role === 'user' ? 'text.primary' : 'primary.contrastText',
                                        borderRadius: 1,
                                        px: 1,
                                        py: 0.5,
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {message.text}
                                </Typography>
                            </Box>
                        ))}
                        {loading && <CircularProgress size={20} />}
                    </Box>
                    <Box sx={{ p: 1, borderTop: '1px solid #eee', display: 'flex', gap: 0.5 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="הקלידו שאלה..."
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <IconButton color="primary" onClick={handleSend} disabled={loading || !question.trim()}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>
            )}
            <Fab color="primary" onClick={() => setOpen((prev) => !prev)}>
                {open ? <CloseIcon /> : <ChatIcon />}
            </Fab>
        </Box>
    );
};

export default ChatWidget;
