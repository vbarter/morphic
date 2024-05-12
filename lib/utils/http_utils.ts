import axios from 'axios';

// 你应当从安全的地方（如环境变量）获取你的Personal Access Token和Bot Id
const personalAccessToken = process.env.COZE_PERSONAL_ACCESS_TOKEN;

export async function get_stocker_info(query:string,
                                    bot_id:string,
                                    conversation_id:string="123",
                                    user:string="29032201862555",
                                    stream=true) {
    const url = 'https://api.coze.com/open_api/v2/chat';
    const headers = {
        Authorization: `Bearer pat_gR1tZxWLrVy2J0ZhnA6lf2SK3gnrKdZtcRXhqLy8gqshUfdWAEWhmEk6YSw7OMi5`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.com',
        'Connection': 'keep-alive',
    };
    const data = {
        conversation_id: conversation_id,
        bot_id: bot_id,
        user: user,
        query: query,
        stream: stream
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

