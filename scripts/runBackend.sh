openTab(){
  gnome-terminal --tab --title="$1" --command="bash -c 'echo DO NOT CLOSE THIS TAB BEFORE ENDING THIS PROCESS! [USE CTRL + C] OTHERWISE YOU WILL NEED TO KILL IT MANUALLY... [FUSER COMMAND] && $2; bash'" &
}

openTab "API" "npm run dev:api"
openTab "Analytics" "npm run dev:analytics"