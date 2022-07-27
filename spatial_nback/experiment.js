/*
reference: http://www.sciencedirect.com/science/article/pii/S1053811905001424
Cognitive control and brain resources in major depression: An fMRI study using the n-back task Harvey at al. 2005
This task differs in that the subject only has to respond on target trials, rather than indicating whether the current trial is 
a match or not
*/

/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var current_trial = 0
var stimuli = '123'
var num_blocks = 3 //of each delay
var num_trials = 40
var num_practice_trials = 12
var delays = jsPsych.randomization.shuffle([2])
var control_before = Math.round(Math.random()) //0 control comes before test, 1, after
var stims = [] //hold stims per block
var trialtypes = ['target','non-target'];

var html_stimuli = 
['<div class="stimulus1"></div>',
'<div class="stimulus2"></div>',
'<div class="stimulus3"></div>'];

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	data: {
		trial_id: "attention_check"
	},
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
	'Welcome to the experiment. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox><p class = block-text>In this experiment you will see a sequence of letters presented one at a time. Your job is to respond by pressing the <strong>left arrow key</strong> when the letter matches the same letter that occured either 1, 2 or 3 trials before, otherwise you should press the <strong>down arrow key</strong>. The letters will be both lower and upper case. You should ignore the case (so "t" matches "T")</p><p class = block-text>The specific delay you should pay attention to will differ between blocks of trials, and you will be told the delay before starting a trial block.</p><p class = block-text>For instance, if the delay is 2, you are supposed to press the left arrow key when the current letter matches the letter that occured 2 trials ago. If you saw the sequence: g...G...v...T...b...t...b, you would press the left arrow key on the last "t" and the last "b" and the down arrow key for every other letter.</p><p class = block-text>On one block of trials there will be no delay. On this block you will be instructed to press the left arrow key to the presentation of a specific letter on that trial. For instance, the specific letter may be "t", in which case you would press the left arrow key to "t" or "T".</p></div>',
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'n_back'
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};


var start_practice_block = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Starting practice. During practice, you should press the left arrow key when the current letter matches the letter that appeared 1 trial before. Otherwise press the down arrow key</p><p class = center-block-text>You will receive feedback about whether you were correct or not during practice. There will be no feedback during the main experiment. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Starting a test block.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var start_control_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "control_intro"
	},
	text: '<div class = centerbox><p class = block-text>In this block you do not have to match letters to previous letters. Instead, press the left arrow key everytime you see a "t" or "T" and the down arrow key for all other letters.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var audio = new Audio();
audio.src = "error.mp3";
audio.loop = false;

function errorDing() {
	audio.play();
}

//Setup 1-back practice
practice_trials = []
for (var i = 0; i < (num_practice_trials); i++) {
	var stim = randomDraw(stimuli)
	stims.push(stim)
	if (i >= 1) {
		target = stims[i - 1]
	}
	if (stim == target) { 
		correct_response = 37
	} else {
		correct_response = 40
	}
	var practice_block = {
		type: 'poldrack-categorize',
		is_html: true,
		stimulus: '<div class = centerbox><div class = center-text>' + stim + '</div></div>',
		key_answer: correct_response,
		data: {
			trial_id: "stim",
			exp_stage: "practice",
			stim: stim,
			target: target
		},
		correct_text: '<div class = centerbox><div style="color:green;font-size:60px"; class = center-text>Correct!</div></div>',
		incorrect_text: '<div class = centerbox><div style="color:red;font-size:60px"; class = center-text>Incorrect</div></div>',
		timeout_message: '<div class = centerbox><div style="font-size:60px" class = center-text>Respond Faster!</div></div>',
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		choices: [37,40],
		timing_stim: 500,
		timing_response: 2000,
		timing_post_trial: 500
	};
	practice_trials.push(practice_block)
}

//Set up experiment
var n_back_experiment = []
n_back_experiment.push(instruction_node);
n_back_experiment.push(start_practice_block)
//n_back_experiment = n_back_experiment.concat(practice_trials)

function setup_nback_trial(stims,i,trialtype,stimuli) {
	var trial = {
		type: 'poldrack-categorize',
		is_html: true,
		correct_text: '',
		incorrect_text: '<script type="text/javascript">errorDing()</script>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
		only_timeout_feedback: true,
		choices: [37,40],
		timing_response: 2500,
		timing_stim: 2500,
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		response_ends_trial: true,
		
		stimulus: '',
		key_answer: [],
		data: {
			trial_id: "",
			exp_stage: "2-back",
			stim: '',
			correct_response: []
		}
	}
	var stim = '';
	var correct_response = 40;
	var small_stim = '';
	var trial_id = 'non-target';
	
	if (i===0) {
		stim = randomDraw(stimuli);
		
	} else if (i===1) {
		small_stim = stimuli.replace(stims[i-1],'');
		stim = randomDraw(small_stim);
		
	} else {
		if (trialtype==='target') {
			trial_id = 'target';
			stim = stims[i-2];
			correct_response = 37;
		} else {
			small_stim = stimuli.replace(stims[i-1],'').replace(stims[i-2],'');
			stim = randomDraw(small_stim);
		}
	}
	trial.stimulus = html_stimuli[parseInt(stim)-1];
	trial.key_answer = correct_response;
	trial.data.stim = stim;
	trial.data.correct_response = correct_response;
	trial.data.trial_id = trial_id;
	//since it's pass by value, need to do the stims.push(stim) outside the function
	//trial.stimulus = stim + ' ' + trial_id;
	
	return trial
}

for (var d = 0; d < delays.length; d++) {
	var delay = delays[d]
	var start_delay_block = {
		type: 'poldrack-text',
		data: {
			trial_id: "delay_text"
		},
		timing_response: 180000,
		text: '<div class = centerbox><p class = block-text>In these next blocks, you should press the left arrow key when the current letter matches the letter that appeared ' +
			delay +
			' trials before. Otherwise press the down arrow key</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
		cont_key: [13]
	};
	n_back_experiment.push(start_delay_block)
	for (var b = 0; b < num_blocks; b++) {
		n_back_experiment.push(start_test_block)
		var target = ''
		stims = []
		
		//do first 2 trials as non-targets just to get things going
		var trialtype = ['non-target','non-target'].concat(jsPsych.randomization.repeat(trialtypes,num_trials/2));
		
		for (var i = 0; i < num_trials+2; i++) {
			
			var trial = setup_nback_trial(stims,i,trialtype[i],stimuli);
			stims.push(trial.data.stim);
			
			n_back_experiment.push(trial)
		}
	}
	n_back_experiment.push(attention_node)
}
n_back_experiment.push(post_task_block)
n_back_experiment.push(end_block)