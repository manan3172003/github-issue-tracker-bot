import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

const app_listener = express();
const app_emitter = express();

app_listener.set('port', 1337);
app_emitter.set('port', 8000);

app_emitter.use(cors());
app_listener.use(cors());

app_listener.use(express.json());  // Middleware to parse JSON bodies

app_listener.post('/webhooks', async function(req, res) {
  try {
    if (req.body.changes.field_value.field_name === "Status") {
      const { from, to } = req.body.changes.field_value;
      console.log('from:', from);
      console.log('to:', to);
      
    } else if (req.body.changes.field_value.field_name === "Assignees") {
      const token = process.env.GITHUB_TOKEN_CLASSIC;
      const query = `
        query {
          node(id: "${req.body.projects_v2_item.content_node_id}") {
            ... on Issue {
              title
              assignees(first: 10) {
                nodes {
                  login
                }
              }
            }
          }
        }`;

      try {
        const response = await axios.post(
          'https://api.github.com/graphql',
          { query },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        const issue = response.data.data.node;
        const assignees = issue.assignees.nodes.map(assignee => assignee.login);

        console.log('Issue title:', issue.title);
        console.log('Assignees:', assignees);
      } catch (error) {
        console.error('Error with GraphQL request:', error);
      }
    }
  } catch (e) {
    console.log("Irrelevant Query");
  }
  res.send('Webhook received');
});

app_listener.listen(app_listener.get('port'), () => {
  console.log(`Listener app is running on port ${app_listener.get('port')}`);
});

app_emitter.listen(app_emitter.get('port'), () => {
  console.log(`Emitter app is running on port ${app_emitter.get('port')}`);
});
