To create a fine-tuned model
        openai -k <API_KEY> api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL>
        for example:
        openai -k "sk-jsgavdajsvdjsad" api fine_tunes.create -t we-wingit-data_prepared.jsonl -m davinci
        
To reconnect the stream (to check how the fine-tune is progressing or see if it has completed)
        openai -k <API_KEY> api fine_tunes.follow -i <YOUR_FINE_TUNE_JOB_ID>
        for example:
        openai -k "sk-kgsadkjags" api fine_tunes.follow -i ft-bfubdoni4737dbsj