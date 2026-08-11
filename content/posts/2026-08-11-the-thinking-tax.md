+++
title = "The Thinking Tax"
date = 2026-08-11T00:00:00Z
description = "I fixed a bug in ten minutes that could've cost me hours, and felt nothing. The fix worked. The understanding never showed up. On what actually goes missing when you let the tool think first."
categories = ["AI", "Software Engineering"]
tags = ["LLMs", "AI in Development", "Software Engineering", "Critical Thinking"]
+++

A few months ago I fixed a bug in ten minutes that could've cost me hours. That's not a brag. That's the whole problem.

PHP app, a fresh deploy onto FrankenPHP, and it came up throwing 500s. Not on every request, which is the worst kind, just some of them, and only sometimes. Hit the same route twice and it'd serve once and fall over the next. The code was fine. The code had run fine the day before on the old setup. Something about this box just quietly hated me.

A year ago I know exactly how those hours go. Reproduce it. Fail to reproduce it. Reproduce it again. Start suspecting the deploy. Rule out the build. Rule out the env vars. Get suspicious of the runtime config nobody ever reads. Swear a little. Eventually the thing clicks, and I walk away understanding not just this bug but the whole species of bug it belongs to.

Instead I described it to an assistant. It's the JIT, it said. Opcache's JIT was compiling hot paths inside FrankenPHP's long-lived workers and blowing up in a way it never did under classic PHP-FPM. Set `opcache.jit=disable`. I did. The 500s stopped.

And I felt nothing. No click. Just a deploy that finally stayed up and a hole where the understanding was supposed to be. I couldn't have told you why JIT fell over under FrankenPHP's worker model and behaved itself under FPM, what the tracing JIT actually does differently in a process that never dies, or whether disabling it was a fix or a tourniquet. I could've told you it was fixed, which, it turns out, is a completely different thing.

That bothered me way more than the bug did.

## It wasn't the AI

For a while I told myself the tool was making me lazy. Convenient story. It makes the robot the villain and lets me off the hook.

It's also a lie. AI wasn't making me lazy. I was using it as a place to dump the thinking I didn't feel like doing. Nothing crawled into my skull and flipped a switch. I handed over the exact part of the job I'll stand up in a meeting and swear I care about, and I did it happily, because it was faster and nobody was looking.

And once I caught it in myself, I couldn't stop seeing it everywhere. In PRs where the author couldn't defend a single line of their own diff. In Slack threads where "the AI said this should work" got dropped like a mic instead of the opening of an actual conversation. In my own commit history, if we're being honest, which apparently we are.

## The part we quietly deleted

There's an old loop every engineer used to run, whether they'd have named it or not.

Something breaks. You get confused. You dig. You form a guess. You test the guess. You're wrong. You understand a little more than you did. Eventually you fix it, and you keep the understanding on the way out.

The confusion in the middle wasn't a bug in the loop. It *was* the loop. That's where the learning lived. The struggle wasn't the toll you paid to reach the answer. The struggle was the point.

The new loop is shorter. Something breaks, you paste it, you copy the fix back, you move on with your life. It's dramatically faster, and that's precisely the problem, because the reason it's faster is that it skips the exact part that used to be doing the work on *you*.

And the thing that went sideways isn't "AI gives answers." Answers are great. The problem was getting one before I'd done enough to earn a real question. The fix landed before I'd formed a single hypothesis of my own, so there was nothing for it to stick to. It just sat there being correct, like a smug houseguest.

## The correct answer is the dangerous one

A wrong answer is the safe one, weirdly. It breaks, you notice, you go dig up why, and you learn something clawing your way back to green. A wrong answer keeps you honest.

A correct answer you just take. And that's where the thinking quietly clocks out, right at the moment everything's working and there's zero reason to look closer. Working code is a fantastic disguise for a missing mental model. You won't find out it's missing today. You'll find out in three months, in production, at 2 a.m., when a constraint shifts and the only thing that can save you is a "why" you never bothered to build.

I have been the person squinting at logs at 2 a.m., hunting for a "why" I approved six months earlier and never actually owned. It is not a good night. Do not recommend.

## The thing I tried

So I taxed myself. Nothing clever, no five-letter acronym to laminate and stick on my monitor. One rule: before I'm allowed to ask, I have to think first. That's it. That's the framework.

For anything non-trivial, I take a few minutes and write down what I actually think is happening before I open the assistant. Out loud, in a comment, in the PR description, I don't care where. The point is committing to a guess while it can still be wrong and cost me nothing but pride. (I've [written about this before](/posts/growing-together-in-the-age-of-llms) from the outside, watching it play out across a team. This is the same finger pointed back at myself.)

Then when the answer comes back, I quit asking "is this right?" and started asking "what did I miss?" Those two questions pull wildly different things out of a model, and out of me. And I make myself explain the final fix in plain words, the way I'd explain it to whoever inherits this code after I'm gone. Can't do that? Then I didn't solve it. I rubber-stamped it.

The surprise wasn't that I solved fewer problems. It's that by the time I opened the assistant at all, my questions had teeth. I'd stopped asking it to think for me and started asking it to check my thinking. Same tool. Completely different person on my end of the prompt.

You can see the whole shift in the prompt itself. "Fix this bug, my deploy's throwing 500s" and "I think it's opcache JIT misbehaving under FrankenPHP's worker mode: it never happened on FPM, and flipping `opcache.jit=disable` would tell us fast. Here's my reasoning. What am I missing?" are the same bug and two different engineers. One of them learns something in the next ten minutes. The other gets a deploy that stays up and a shrug.

## The best AI users aren't the best prompters

The entire conversation around these tools is about prompting. Better prompts, cleverer structures, the one magic phrase that unlocks the good model. I think we're all staring at the wrong thing.

The people who get the most out of AI aren't the ones with the slickest prompts. They're the ones who know which question is even worth asking, and can smell it the second a confident answer is quietly, catastrophically wrong. That's not a prompting skill. That's domain knowledge wearing a prompt as a Halloween costume.

And it only runs one direction. Know your domain, and you ask sharper questions and catch the garbage on the way back. Don't, and the polished wrong answer sails straight through, because you don't know enough to poke a hole in it. Cheap generation makes that second failure both way more common and way more expensive. "It looked right" is going to be on a lot of postmortems.

## What I'm not saying

I'm not going back. If I dressed this up as some noble return to hand-writing everything, you'd smell the bullshit a mile off, and you'd be right. I use these tools constantly, boilerplate, tests, docs, refactors, exploring an API I've never touched, spitting out three versions of something so I can throw two away. They're too good to be precious about.

I changed exactly one thing. I don't want AI to be the first thing that thinks about my problem. I want that to be me. After that, have at it, go nuts.

Because when generating answers gets cheap, the expensive thing becomes knowing which answer to trust. That's not code. That's judgment, and it's the one part of this job actually worth guarding with your life. Let the tool write the boring stuff, generate the options, find the edge cases, pick a fight with your design. Just don't hand it the deciding.

And this is the part I actually care about, because it's bigger than my one embarrassing JIT flag. If you're on my team, or any team, I don't want you to out-type the machine. That's a race you lose, and it's a stupid race to enter. I want you to out-*think* it. Do the boring, humbling thing first: sit with the problem, form a guess, be wrong, understand why. That's not nostalgia. That's the only way anybody's ever gotten better at this, and the tool being fast doesn't change it. It just makes it easier to skip, and skipping it is how you spend five years shipping code and end up unable to explain a line of it.

So here's the question I keep chewing on, and I'm handing it to you. Last time the AI solved something for you, did *you* solve it? Or did you just approve it?

Maybe the real skill was never prompting. Maybe it's knowing when not to prompt yet.

You don't have an AI problem. You have a thinking problem. I've got one too. Difference is I'm working on mine, and I'd love some company.
