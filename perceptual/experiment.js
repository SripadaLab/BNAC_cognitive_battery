/*
Anti-saccade task
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

var num_practice_trials = 4 //per trial type
var blocks = jsPsych.randomization.shuffle(['F','O','B'])

var factors = { 
	freq: ['0.0655','0.0640','0.0610','0.0595'], 
	orient: ['48','46.5','43.5','42'], 
	bright: ['152','140','116','104']
}
var nstimuli = factors.freq.length * factors.orient.length * factors.bright.length;
var total_trials_per_block = 192;
var trial_reps_per_block = total_trials_per_block / nstimuli;

var initial_full_designF = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);
var initial_full_designO = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);
var initial_full_designB = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);

var ts_num_blocks = 4;
var ts_num_trials = 192;

var ts_F = jsPsych.randomization.factorial(factors,ts_num_blocks,true);
var ts_O = jsPsych.randomization.factorial(factors,ts_num_blocks,true);
var ts_B = jsPsych.randomization.factorial(factors,ts_num_blocks,true);

//lets try generating 64 non-switch pairs and 64 of each other for each task, then randomize
//now measure percentages
function check_order(order) {
	
	var last_trial = '';
	var count = [
		[0,0,0],
		[0,0,0]
		];
		
	for (i=0; i<order.length; i++) {
		var s = 1;
		if (order[i]==last_trial) {
			s=0;
		}
		if (order[i]=='F') {
			count[s][0] = count[s][0]+1;
		}
		if (order[i]=='O') {
			count[s][1] = count[s][1]+1;
		}
		if (order[i]=='B') {
			count[s][2] = count[s][2]+1;
		}
		last_trial = order[i];
	}
	return count;
}

function return_order(order) {
	//report back trial types and switch/non-switch
	var last_trial = '';

	var switch_order = [];
	
	for (i=0; i<order.length; i++) {
		var s = 1;
		if (order[i]==last_trial) {
			s=0;
		}
		var trial = 'error';
		if (s==1) {
			trial = 'switch';
		} else if ( s==0 ) {
			trial = 'non-switch';
		}
		switch_order[i] = trial;
		last_trial = order[i];
	}
	return switch_order;
}
	
var ok = 0;
while (ok==0) {
	var f_stim = jsPsych.randomization.factorial(factors,4,true);
	var o_stim = jsPsych.randomization.factorial(factors,4,true);
	var b_stim = jsPsych.randomization.factorial(factors,4,true);
	var f_arr = jsPsych.randomization.repeat(['FF','O','B'],64);
	var o_arr = jsPsych.randomization.repeat(['F','OO','B'],64);
	var b_arr = jsPsych.randomization.repeat(['F','O','BB'],64);

	var arr = f_arr.concat(o_arr).concat(b_arr);

	//var order = jsPsych.randomization.shuffleNoRepeats(arr);
	var order = jsPsych.randomization.shuffle(arr);
	var final_order = [];
	for (i = 0; i<order.length; i++) {
		final_order = final_order.concat(order[i].split(''));
	}

	var tmp = check_order(final_order);
	var totals = tmp[0].map(function (num,idx) { return num+tmp[1][idx]});
	//if (Math.round(100*tmp[0][0]/totals[0])==40.0 & Math.round(100*tmp[1][0]/totals[0])==60.0) {
	//	if (Math.round(100*tmp[0][1]/totals[1])==40.0 & Math.round(100*tmp[1][1]/totals[1])==60.0) {
	//		if (Math.round(100*tmp[0][2]/totals[2])==40.0 & Math.round(100*tmp[1][2]/totals[2])==60.0) {
	//			ok=1;
	//		}
	//	}
	//}
	if (tmp[0][0]/totals[0]==0.5 & tmp[1][0]/totals[0]==0.5) {
		if (tmp[0][1]/totals[1]==0.5 & tmp[1][1]/totals[1]==0.5) {
			if (tmp[0][2]/totals[2]==0.5 & tmp[1][2]/totals[2]==0.5) {
				ok=1;
			}
		}
	}	
	//ok=1;
}

var switch_order = return_order(final_order);

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
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>'],
   rows: [15],
   columns: [60]
};

/* define static blocks */
var feedback_instruct_text =
	'<div class="block-text">Welcome to the experiment. Press <strong>enter</strong> to begin.</div>'
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
		'<div class = centerbox><p class = block-text>In this task, you will be shown stimuli consisting of black and white lines that fade into a grey background. Your job is to categorize each stimulus depending on the cue you have been presented with before the stimulus. There will be several different types of categorization method. Each will be presented with instructions and a practice before starting that task.</p></div>',
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
				'<div class="block-text">Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.</div>'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = '<div class="block-text">Done with instructions. Press <strong>enter</strong> to continue.</div>'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'perceptual'
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};


var start_practice_block = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Practice is coming up next. Remember, you should press the left arrow key when the number is odd, and the down arrow key when the number is even. </p><p class = block-text>During practice, you will receive feedback about whether you were correct or not. There will be no feedback during the main experiment. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var interblock_rest = {
	type: 'poldrack-text',
	text: '<div class=centerbox><p class=center-block-text>Take a short break.</p><p>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "interblock rest"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var intertrial_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = center-text> </div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 0,
	timing_stim: 350,
	timing_response: 350
};

var audio = new Audio();
audio.src = "error.mp3";
audio.loop = false;

function errorDing() {
	audio.play();
}

//Set up experiment
var perceptual_experiment = []
perceptual_experiment.push(instruction_node);

function practiceTrials(block) {
	var trial = [];
	
	var practice_text = "error";
	var block_label = "error";
	var prompt_text = "error";
	if (block=='F') {
		practice_text="frequency";
		block_label="frequency practice";
		prompt_text = '<p class=F>MANY or FEW?</p>';
	} else if (block=='O') {
		practice_text="orientation";
		block_label="orientation practice";
		prompt_text = '<p class=O>STEEP or SHALLOW?</p>';
	} else if (block=='B') {
		practice_text="brightness";
		block_label="brightness practice";
		prompt_text = '<p class=B>LIGHT or DARK?</p>';
	}
	
	var freq = randomDraw(factors.freq);
	var orient = randomDraw(factors.orient);
	var bright = randomDraw(factors.bright);
	
	var stim = 'f' + freq + '_a' + orient + '_b' + bright + '.png';
	
	var target = 40;
	var correct_response = 40;
	
	if (block=='F') {
		if (freq == factors.freq[0] | freq == factors.freq[1]) {
			target=37;
			correct_response=37;
		}			
	} else if (block=='O') {
		if (orient == factors.orient[0] | orient == factors.orient[1]) {
			target=37;
			correct_response=37;
		}	
	} else if (block=='B') {
		if (bright == factors.bright[0] | bright == factors.bright[1]) {
			target=37;
			correct_response=37;
		}	
	}

	var cue_block = {
			type: 'poldrack-single-stim',
			is_html: true,
			stimulus: '<div class=centerbox><div style="font-size:60px;" class="block-text">' + prompt_text + '</div></div>',
			choices: 'none',
			data: {
				trial_id: "cue"
			},
			timing_stim: 550,
			timing_response: 550,
			timing_post_trial: 100
	};
	
	var stim_block = {
			type: 'poldrack-categorize',
			is_html: true,
			stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + stim + '></div></div>',
			data: {
				trial_id: "gabor practice",
				exp_stage: block_label,
				stim: stim,
				target: target,
				correct_response: correct_response,
			},
			choices: [37,40],
			key_answer: correct_response,
			response_ends_trial: true,
			correct_text: '<div class = centerbox><div style="color:green;font-size:60px"; class = block-text>Correct!</div></div>',
			incorrect_text: '<div class = centerbox><div style="color:red;font-size:60px"; class = block-text>Incorrect</div></div><script type="text/javascript">errorDing()</script>',
			timeout_message: '<div class = centerbox><div style="font-size:60px" class = block-text>Respond Faster!</div></div>',
			timing_feedback_duration: 500,
			show_stim_with_feedback: false,
			timing_stim: 2000,
			timing_response: 2000,
			timing_post_trial: 0
	};
				
	trial.push(cue_block);
	trial.push(stim_block);
	trial.push(intertrial_fixation_block);	
	return trial;
}

var b_instructions = []
var b_task_instructions_1 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>For this task you will be shown stimuli consisting of black and white lines that fade into a grey background. Your job is to categorize each stimulus depending on whether the grey background is <strong class=B>LIGHT or DARK</strong>.</p><p class=block-text>The following three stimuli have a <strong class=B>LIGHT</strong> background.</p><p class=center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "brightness task instructions 1"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[0] + '.png';
var b_example_1_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness light example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[1] + '.png';
var b_example_1_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness light example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[0] + '.png';
var b_example_1_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness light example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var b_task_instructions_2 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The following three stimuli have a <strong class=B>DARK</strong> background.</p><p class=center-block-text>Press <strong>enter</strong> to continue</p></div>',
	cont_key: [13],
	data: {
		trial_id: "brightness task instructions 2"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[3] + '.png';
var b_example_2_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness dark example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[2] + '.png';
var b_example_2_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness dark example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + randomDraw(factors.orient) + '_b' + factors.bright[3] + '.png';
var b_example_2_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "brightness dark example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var b_task_instructions_3 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Each stimulus will follow a cue that reminds you of the categorization to be made: <strong class=B>LIGHT or DARK?</strong>. When presented with the stimulus, you should press the <strong>left</strong> arrow for <strong class=B>LIGHT</strong> or the <strong>down</strong> arrow for <strong class=B>DARK</strong>. Many of these stimuli are difficult to categorize, so everyone will make some incorrect choices. If you are not sure which category to choose, just take your best guess. Try to make your responses quickly. If you respond too slowly, you will receive a feedback message that says "Respond faster!".</p><p class=block-text>The following round contains 20 practice trials.</p><p class=center-block-text>Press <strong>enter</strong> to begin practice.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "brightness task instructions 3"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var b_task_instructions_4 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The next round contains more trials in which you will have to determine whether each stimulus is <strong class=B>LIGHT or DARK</strong>. Unlike the practice block you just completed, you will not receive any feedback if your choice is correct. If your choice is incorrect, you will hear a tone. Remember that this task is designed to be difficult and that everyone makes some incorrect choices. Try your best to respond quickly and accurately on each trial, and if you are unsure, take your best guess.</p><p class=center-block-text>Press <strong>enter</strong> to begin this block.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "brightness task instructions 4"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

b_instructions.push(b_task_instructions_1);
b_instructions.push(b_example_1_1);
b_instructions.push(b_example_1_2);
b_instructions.push(b_example_1_3);
b_instructions.push(b_task_instructions_2);
b_instructions.push(b_example_2_1);
b_instructions.push(b_example_2_2);
b_instructions.push(b_example_2_3);
b_instructions.push(b_task_instructions_3);
//insert practice trials
var practice = [];
for (i = 0; i<20; i++) {
	practice = practice.concat(practiceTrials('B'));
}
b_instructions = b_instructions.concat(practice);
b_instructions.push(b_task_instructions_4);











var o_instructions = []
var o_task_instructions_1 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>For this task you will be shown stimuli consisting of black and white lines that fade into a grey background. Your job is to categorize each stimulus depending on whether the lines are at a <strong class=O>STEEP</strong> angle (closer to being vertical/top-to-bottom) or at a <strong class=O>SHALLOW</strong> angle (closer to being horizontal/right-to-left).</p><p class=block-text>The following three stimuli have lines at a <strong class=O>STEEP</strong> angle.</p><p class=center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "orientation task instructions 1"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[0] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_1_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation steep example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[1] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_1_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation steep example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[0] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_1_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation steep example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var o_task_instructions_2 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The following three stimuli have lines at a <strong class=O>SHALLOW</strong> angle.</p><p class=center-block-text>Press <strong>enter</strong> to continue</p></div>',
	cont_key: [13],
	data: {
		trial_id: "orientation task instructions 2"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[3] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_2_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation shallow example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[2] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_2_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation shallow example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + randomDraw(factors.freq) + '_a' + factors.orient[3] + '_b' + randomDraw(factors.bright) + '.png';
var o_example_2_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "orientation shallow example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var o_task_instructions_3 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Each stimulus will follow a cue that reminds you of the categorization to be made: <strong class=O>STEEP or SHALLOW?</strong>. When presented with the stimulus, you should press the <strong>left</strong> arrow for <strong class=O>STEEP</strong> or the <strong>down</strong> arrow for <strong class=O>SHALLOW</strong>. Many of these stimuli are difficult to categorize, so everyone will make some incorrect choices. If you are not sure which category to choose, just take your best guess. Try to make your responses quickly. If you respond too slowly, you will receive a feedback message that says "Respond faster!".</p><p class=block-text>The following round contains 20 practice trials.</p><p class=center-block-text>Press <strong>enter</strong> to begin practice.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "orientation task instructions 3"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var o_task_instructions_4 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The next round contains more trials in which you will have to determine whether each stimulus is <strong class=O>STEEP or SHALLOW</strong>. Unlike the practice block you just completed, you will not receive any feedback if your choice is correct. If your choice is incorrect, you will hear a tone. Remember that this task is designed to be difficult and that everyone makes some incorrect choices. Try your best to respond quickly and accurately on each trial, and if you are unsure, take your best guess.</p><p class=center-block-text>Press <strong>enter</strong> to begin this block.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "orientation task instructions 4"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

o_instructions.push(o_task_instructions_1);
o_instructions.push(o_example_1_1);
o_instructions.push(o_example_1_2);
o_instructions.push(o_example_1_3);
o_instructions.push(o_task_instructions_2);
o_instructions.push(o_example_2_1);
o_instructions.push(o_example_2_2);
o_instructions.push(o_example_2_3);
o_instructions.push(o_task_instructions_3);
//insert practice trials
var practice = [];
for (i = 0; i<20; i++) {
	practice = practice.concat(practiceTrials('O'));
}
o_instructions = o_instructions.concat(practice);
o_instructions.push(o_task_instructions_4);














var f_instructions = []
var f_task_instructions_1 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>For this task you will be shown stimuli consisting of black and white lines that fade into a grey background. Your job is to categorize each stimulus depending on whether there are <strong class=F>MANY</strong> lines or <strong class=F>FEW</strong> lines.</p><p class=block-text>The following three stimuli have <strong class=F>MANY</strong> lines.</p><p class=center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "frequency task instructions 1"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + factors.freq[0] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_1_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency many example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + factors.freq[1] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_1_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency many example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + factors.freq[0] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_1_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency many example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var f_task_instructions_2 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The following three stimuli have <strong class=F>FEW</strong> lines.</p><p class=center-block-text>Press <strong>enter</strong> to continue</p></div>',
	cont_key: [13],
	data: {
		trial_id: "frequency task instructions 2"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var example_stim = 'f' + factors.freq[3] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_2_1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency few example 1"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + factors.freq[2] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_2_2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency few example 2"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};
var example_stim = 'f' + factors.freq[3] + '_a' + randomDraw(factors.orient) + '_b' + randomDraw(factors.bright) + '.png';
var f_example_2_3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + example_stim + '></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "frequency few example 3"
	},
	timing_post_trial: 500,
	timing_stim: 2000,
	timing_response: 2000	
};

var f_task_instructions_3 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Each stimulus will follow a cue that reminds you of the categorization to be made: <strong class=F>MANY or FEW?</strong>. When presented with the stimulus, you should press the <strong>left</strong> arrow for <strong class=F>MANY</strong> or the <strong>down</strong> arrow for <strong class=F>FEW</strong>. Many of these stimuli are difficult to categorize, so everyone will make some incorrect choices. If you are not sure which category to choose, just take your best guess. Try to make your responses quickly. If you respond too slowly, you will receive a feedback message that says "Respond faster!".</p><p class=block-text>The following round contains 20 practice trials.</p><p class=center-block-text>Press <strong>enter</strong> to begin practice.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "frequency task instructions 3"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var f_task_instructions_4 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The next round contains more trials in which you will have to determine whether each stimulus is <strong class=F>MANY or FEW</strong>. Unlike the practice block you just completed, you will not receive any feedback if your choice is correct. If your choice is incorrect, you will hear a tone. Remember that this task is designed to be difficult and that everyone makes some incorrect choices. Try your best to respond quickly and accurately on each trial, and if you are unsure, take your best guess.</p><p class=center-block-text>Press <strong>enter</strong> to begin this block.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "frequency task instructions 4"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

f_instructions.push(f_task_instructions_1);
f_instructions.push(f_example_1_1);
f_instructions.push(f_example_1_2);
f_instructions.push(f_example_1_3);
f_instructions.push(f_task_instructions_2);
f_instructions.push(f_example_2_1);
f_instructions.push(f_example_2_2);
f_instructions.push(f_example_2_3);
f_instructions.push(f_task_instructions_3);
//insert practice trials
var practice = [];
for (i = 0; i<20; i++) {
	practice = practice.concat(practiceTrials('F'));
}
f_instructions = f_instructions.concat(practice);
f_instructions.push(f_task_instructions_4);

































for (var d = 0; d < blocks.length; d++) {
	//perceptual_experiment.push(start_practice_block);
	var block = blocks[d]
	
	var practice_text = "error";
	var block_label = "error";
	var full_design = "error";
	var prompt_text = "error";
	var instructions = "error";
	
	if (block=='F') {
		practice_text="frequency";
		block_label="frequency block";
		full_design = initial_full_designF;
		prompt_text = '<p class=F>MANY or FEW?</p>';
		instructions = f_instructions;
	} else if (block=='O') {
		practice_text="orientation";
		block_label="orientation block";
		full_design = initial_full_designO;
		prompt_text = '<p class=O>STEEP or SHALLOW?</p>';
		instructions = o_instructions;
	} else if (block=='B') {
		practice_text="brightness";
		block_label="brightness block";
		full_design = initial_full_designB;
		prompt_text = '<p class=B>LIGHT or DARK?</p>';
		instructions = b_instructions;
	}
	
	var start_block = {
		type: 'poldrack-text',
		data: {
			trial_id: block_label
		},
		timing_response: 180000,
		text: '<div class = centerbox><p class = block-text>For the trials in this block, the number will always appear on the <i>' + practice_text + ' side</i> as the white flash.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
		cont_key: [13]
	};
	//perceptual_experiment.push(start_block)
			
	var target = '';
	
	perceptual_experiment = perceptual_experiment.concat(instructions);
	
	//freq: ['0.0525','0.0575','0.0675','0.0725'], 
	//orient: ['35','40','50','55'], 
	//bright: ['112','120','136','144']
	
	for (var i = 0; i < total_trials_per_block; i++) {
		var stim = 'f' + full_design.freq[i] + '_a' + full_design.orient[i] + '_b' + full_design.bright[i] + '.png';
		
		target = 40;
		correct_response = 40;
		
		if (block=='F') {
			if (full_design.freq[i] == factors.freq[0] | full_design.freq[i] == factors.freq[1]) {
				target=37;
				correct_response=37;
			}			
		} else if (block=='O') {
			if (full_design.orient[i] == factors.orient[0] | full_design.orient[i] == factors.orient[1]) {
				target=37;
				correct_response=37;
			}	
		} else if (block=='B') {
			if (full_design.bright[i] == factors.bright[0] | full_design.bright[i] == factors.bright[1]) {
				target=37;
				correct_response=37;
			}	
		}

		var cue_block = {
				type: 'poldrack-single-stim',
				is_html: true,
				stimulus: '<div class=centerbox><div style="font-size:60px;" class="block-text">' + prompt_text + '</div></div>',
				choices: 'none',
				data: {
					trial_id: "cue"
				},
				timing_stim: 550,
				timing_response: 550,
				timing_post_trial: 100
		};
		
		var stim_block = {
				type: 'poldrack-categorize',
				is_html: true,
				stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + stim + '></div></div>',
				data: {
					trial_id: practice_text,
					exp_stage: block_label,
					stim: stim,
					target: target,
					correct_response: correct_response,
				},
				choices: [37,40],
				key_answer: correct_response,
				response_ends_trial: true,
				correct_text: '',
				incorrect_text: '<script type="text/javascript">errorDing()</script>',
				timeout_message: '<div class = centerbox><div style="font-size:60px" class = block-text>Respond Faster!</div></div>',
				only_timeout_feedback: true,
				timing_stim: 2000,
				timing_response: 2000,
				timing_post_trial: 0
		};
					
		perceptual_experiment.push(cue_block);
		perceptual_experiment.push(stim_block);
		perceptual_experiment.push(intertrial_fixation_block);
	}
	perceptual_experiment.push(interblock_rest);
}


//task switching
var ts_task_instructions_1 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>For the next several rounds, you will continue to be presented with stimuli and you will be asked to categorize each one based on one of the three categorization methods that you have just practiced. A cue presented before each stimulus will instruct you on the correct choice to make:</p><p class=center-block-text><strong class=B>LIGHT or DARK?</strong> means you should determine whether the grey background is <strong class=B>LIGHT</strong> or <strong class=B>DARK</strong>.</p><p class=center-block-text><strong class=O>STEEP or SHALLOW</strong> means you should determine whether the lines are at a <strong class=O>STEEP</strong> angle or a <strong class=O>SHALLOW</strong> angle.</p><p class=center-block-text><strong class=F>MANY or FEW</strong> means that you should determine whether there are <strong class=F>MANY</strong> or <strong class=F>FEW</strong> lines.</p><p class=center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "switching instructions 1"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var ts_task_instructions_2 = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>The stimuli shown in the following blocks are the same as those shown previously in the blocks where you only had to use one of the categorization methods, so the definitions of <strong class=B>LIGHT</strong>, <strong class=B>DARK</strong>, <strong class=O>STEEP</strong>, <strong class=O>SHALLOW</strong>, <strong class=F>MANY</strong>, and <strong class=F>FEW</strong> have not changed. The only difference is that the categorization method will change from stimulus to stimulus. Sometimes it will be the same method as the previous stimulus, but other times the method will change. It is important that you pay attention to the cue presented before each stimulus so that you know which method to use. Just like the previous blocks, the task is designed to be difficult and everyone makes some incorrect choices. Try your best to respond quickly and accurately on each trial, and if you are unsure take your best guess.</p><p class=center-block-text>Press <strong>enter</strong> to start.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "switching instructions 1"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

perceptual_experiment = perceptual_experiment.concat(ts_task_instructions_1);
perceptual_experiment = perceptual_experiment.concat(ts_task_instructions_2);

var f_idx = 0;
var o_idx = 0;
var b_idx = 0;

for (j = 0; j<final_order.length; j++) {
	var block = final_order[j];

	var practice_text = "error";
	var block_label = "task switching";
	var prompt_text = "error";
	var full_design = "error";
	var i = 0;
	
	if (block=='F') {
		practice_text="frequency";
		prompt_text = '<p class=F>MANY or FEW?</p>';
		i = f_idx;
		full_design = ts_F;
		f_idx++;
	} else if (block=='O') {
		practice_text="orientation";
		prompt_text = '<p class=O>STEEP or SHALLOW?</p>';
		i = o_idx;
		full_design = ts_O;
		o_idx++;
	} else if (block=='B') {
		practice_text="brightness";
		prompt_text = '<p class=B>LIGHT or DARK?</p>';
		i = b_idx;
		full_design = ts_B;
		b_idx++;
	}
			
	var target = '';

	var trial_type = practice_text + " " + switch_order[j];
	
	//freq: ['0.0525','0.0575','0.0675','0.0725'], 
	//orient: ['35','40','50','55'], 
	//bright: ['112','120','136','144']

	var stim = 'f' + full_design.freq[i] + '_a' + full_design.orient[i] + '_b' + full_design.bright[i] + '.png';
	
	target = 40;
	correct_response = 40;
	
	if (block=='F') {
		if (full_design.freq[i] == factors.freq[0] | full_design.freq[i] == factors.freq[1]) {
			target=37;
			correct_response=37;
		}			
	} else if (block=='O') {
		if (full_design.orient[i] == factors.orient[0] | full_design.orient[i] == factors.orient[1]) {
			target=37;
			correct_response=37;
		}	
	} else if (block=='B') {
		if (full_design.bright[i] == factors.bright[0] | full_design.bright[i] == factors.bright[1]) {
			target=37;
			correct_response=37;
		}	
	}

	var cue_block = {
			type: 'poldrack-single-stim',
			is_html: true,
			stimulus: '<div class=centerbox><div style="font-size:60px;" class="block-text">' + prompt_text + '</div></div>',
			choices: 'none',
			data: {
				trial_id: "cue"
			},
			timing_stim: 550,
			timing_response: 550,
			timing_post_trial: 100
	};
	
	var stim_block = {
			type: 'poldrack-categorize',
			is_html: true,
			stimulus: '<div class=centerbox><div class=img-container><img src=stim/' + stim + '></div></div>',
			data: {
				trial_id: trial_type,
				exp_stage: block_label,
				stim: stim,
				target: target,
				correct_response: correct_response,
			},
			choices: [37,40],
			key_answer: correct_response,
			response_ends_trial: true,
			correct_text: '',
			incorrect_text: '<script type="text/javascript">errorDing()</script>',
			timeout_message: '<div class = centerbox><div style="font-size:60px" class = block-text>Respond Faster!</div></div>',
			only_timeout_feedback: true,
			timing_stim: 2000,
			timing_response: 2000,
			timing_post_trial: 0
	};
				
	perceptual_experiment.push(cue_block);
	perceptual_experiment.push(stim_block);
	perceptual_experiment.push(intertrial_fixation_block);
		

	if (j>0 & (j%ts_num_trials)==0) {
		perceptual_experiment.push(interblock_rest);
	}
}











perceptual_experiment.push(post_task_block)
perceptual_experiment.push(end_block)