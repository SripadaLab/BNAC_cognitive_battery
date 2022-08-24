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
	freq: ['0.0525','0.0575','0.0675','0.0725'], 
	orient: ['35','40','50','55'], 
	bright: ['112','120','136','144']
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
		'<div class = centerbox><p class = block-text>In this task, you will see two empty squares on the right and left sides of a cross in the middle of the screen. Soon after the two squares appear, one of them will be filled with a white flash. Right after the white flash, a number will appear very quickly in one of the squares and will then be covered up by a pattern.</p><p class= block-text>You should press the left arrow button if the number shown is odd (3, 5, or 7) and press the down arrow button if the number shown is even (2, 4, or 6). This task is difficult because the number only appears on the screen for a very short amount of time but try your best to guess whether the number is odd or even based on what you are able to see.</p><p class=block-text>In some of the trials in this task, the number will appear on the same side as the white flash, but in other trials the number will appear on the opposite side. You will be told before each block of trials whether the number will appear on the same side or the opposite side as the white flash.</p></div>',
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
	text: '<div class=centerbox><div class=center-text> <p>Take a short break.</p><p>Press <strong>enter</strong> to continue.</p></div></div>',
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

for (var d = 0; d < blocks.length; d++) {
	perceptual_experiment.push(start_practice_block);
	var block = blocks[d]
	
	var practice_text = "error";
	var block_label = "error";
	var full_design = "error";
	var prompt_text = "error";
	if (block=='F') {
		practice_text="frequency";
		block_label="frequency block";
		full_design = initial_full_designF;
		prompt_text = '<p class=F>MANY or FEW?</p>';
	} else if (block=='O') {
		practice_text="orientation";
		block_label="orientation block";
		full_design = initial_full_designO;
		prompt_text = '<p class=O>STEEP or SHALLOW?</p>';
	} else if (block=='B') {
		practice_text="brightness";
		block_label="brightness block";
		full_design = initial_full_designB;
		prompt_text = '<p class=B>LIGHT or DARK?</p>';
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
	perceptual_experiment.push(start_block)
			
	var target = '';
	
	
	//freq: ['0.0525','0.0575','0.0675','0.0725'], 
	//orient: ['35','40','50','55'], 
	//bright: ['112','120','136','144']
	
	for (var i = 0; i < total_trials_per_block; i++) {
		var stim = 'f' + full_design.freq[i] + '_a' + full_design.orient[i] + '_b' + full_design.bright[i] + '.png';
		
		target = 40;
		correct_response = 40;
		
		if (block=='F') {
			if (full_design.freq[i] == '0.0675' | full_design.freq[i] == '0.0725') {
				target=37;
				correct_response=37;
			}			
		} else if (block=='O') {
			if (full_design.orient[i] == '50' | full_design.orient[i] == '55') {
				target=37;
				correct_response=37;
			}	
			if (full_design.bright[i] == '136' | full_design.bright[i] == '144') {
		} else if (block=='B') {
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
					trial_id: "gabor",
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
perceptual_experiment.push(post_task_block)
perceptual_experiment.push(end_block)