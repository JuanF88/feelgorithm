// English translation of MATRIZ (see matriz.js). Same structure and keys: case
// (ID) → Spanish emotion key (Felicidad/Enojo/Asco/Tristeza/Miedo) and Spanish
// decision keys (Like/Comentar/Compartir/Ignorar/Denunciar) are kept as-is because
// the game looks them up by those keys; only the VALUES are translated.
// The «guillemets» are preserved so the corridor can extract the thought.

export const MATRIZ_EN = {
  "1.0": {
    "Felicidad": {
      "distorsiones": [
        "Emotional reasoning — «I'm glad to see I was right, so this message must be true».",
        "Overgeneralization — «A chain message like this confirms the whole country is already heading toward communism».",
        "Disqualifying the positive — «Even if there are institutions and safeguards, none of that matters if there's still a risk of communism»."
      ],
      "decisiones": {
        "Like": "The algorithm reads your reaction as interest and shows you more content that confirms your stance.",
        "Comentar": "The post gains reach and your comment can turn a feeling of triumph into public validation.",
        "Compartir": "The chain reaches new contacts without verification and reinforces the idea that “everyone knows it”.",
        "Ignorar": "You don't amplify it, but the belief that satisfied you stays unexamined.",
        "Denunciar": "It can reduce its spread if it's deceptive; reporting merely out of political disagreement would be a misuse of the tool."
      },
      "ejercicio": "Take a 10-second pause. Ask yourself: “Am I glad to have evidence, or glad to feel my group is right?”. Take two slow breaths before acting.",
      "consejo": "Verify what confirms your beliefs too. Feeling satisfied doesn't turn a claim into evidence."
    },
    "Enojo": {
      "distorsiones": [
        "Catastrophizing — «If I don't react now, I'll lose the country and everything I have».",
        "All-or-nothing thinking — «Either I'm with those who defend Colombia or with those who want to destroy it».",
        "Labeling — «Anyone who supports those proposals is a communist and an enemy»."
      ],
      "decisiones": {
        "Like": "You reward the content that outraged you, and the algorithm learns to show you more polarizing messages.",
        "Comentar": "You raise its visibility and the conversation can escalate into insults or personal attacks.",
        "Compartir": "You turn anger into spread and can provoke outrage in other people.",
        "Ignorar": "You avoid amplifying it, though the anger can keep influencing your decisions if you don't examine it.",
        "Denunciar": "You channel the anger into a less impulsive action, as long as you verify there's real deception or a violation."
      },
      "ejercicio": "STOP technique: pause, inhale for 4 seconds and exhale for 6, four times. Name which phrase triggered your anger and wait a minute before deciding.",
      "consejo": "Outrage is a signal to slow down. Look for the original source and avoid responding while you're activated."
    },
    "Asco": {
      "distorsiones": [
        "Labeling — «People who think like that are despicable».",
        "Overgeneralization — «Everyone who supports those ideas wants to take what's ours».",
        "Emotional reasoning — «They disgust me, so they must be dangerous»."
      ],
      "decisiones": {
        "Like": "You normalize a message that turns a political group into something despicable.",
        "Comentar": "Even while rejecting it, you may repeat offensive labels and widen its reach.",
        "Compartir": "You spread the contempt and encourage dehumanizing the opponent.",
        "Ignorar": "You don't contribute to its spread, but the activated prejudice can remain intact.",
        "Denunciar": "It helps limit degrading content if it breaks the rules; it's best to keep evidence and pick the right category."
      },
      "ejercicio": "Describe the message without insults or labels. Write three observable facts and separate the people from the idea being discussed.",
      "consejo": "Distrust messages that replace arguments with degrading labels. Evaluate concrete proposals, not collective identities."
    },
    "Tristeza": {
      "distorsiones": [
        "Mental filter — «I only see signs that Colombia is getting worse».",
        "Fortune-telling — «This is going to end badly and we won't be able to stop it».",
        "Disqualifying the positive — «Even if there are laws and safeguards, none of it will protect us»."
      ],
      "decisiones": {
        "Like": "The algorithm records interaction, not sadness, and can show you more pessimistic content.",
        "Comentar": "The post gains reach and can reinforce a conversation of collective hopelessness.",
        "Compartir": "You spread a fatalistic view of the country and can deepen other people's discouragement.",
        "Ignorar": "You avoid spreading it, but you may be left with a sense of helplessness and without checking the information.",
        "Denunciar": "It can restore a sense of agency if the chain is deceptive, but it must go together with verification."
      },
      "ejercicio": "Do the 5-4-3-2-1 exercise and split a sheet into: what I know, what I don't know, and what I can check.",
      "consejo": "A viral chain message can't predict the country's future. Cross-check with data, context and diverse sources."
    },
    "Miedo": {
      "distorsiones": [
        "Catastrophizing — «They're going to take my savings and then my house».",
        "Magnification — «Any political change can turn into a huge threat to my freedom».",
        "Mind reading — «If the media don't talk about this, they must be hiding it because they're part of the plan»."
      ],
      "decisiones": {
        "Like": "You signal to the algorithm that the alarmist message caught your attention.",
        "Comentar": "The alert gets more visibility and can turn a doubt into collective panic.",
        "Compartir": "You spread an unverified threat and pressure others to react with fear.",
        "Ignorar": "You don't spread it, but the uncertainty remains if you don't look for reliable information.",
        "Denunciar": "It can stop a deceptive chain after you verify it and report it in the right category."
      },
      "ejercicio": "Inhale for 4 seconds and exhale for 6. Then ask: “Is there an immediate threat? What evidence confirms it and what evidence is missing?”",
      "consejo": "Before forwarding an alert, check the author, date, primary source and evidence; look for whether trusted media or fact-checkers have confirmed it."
    }
  },
  "2.0": {
    "Felicidad": {
      "distorsiones": [
        "All-or-nothing thinking — «If a family doesn't follow these roles, then it can't work well».",
        "Overgeneralization — «Since some traditional families I know work, all families should live that way».",
        "“Should” statements — «Women should take care of the home and men should make the important decisions»."
      ],
      "decisiones": {
        "Like": "The algorithm reads your reaction as affinity and shows you more content that idealizes traditional roles.",
        "Comentar": "The post gains reach and your comment can turn a personal experience into a rule for all families.",
        "Compartir": "The message reaches more people and reinforces the idea that only one kind of family is valid.",
        "Ignorar": "You don't amplify the content, but the nostalgia can stay unexamined and keep guiding your judgments.",
        "Denunciar": "It can limit its spread if it breaks the rules; reporting merely out of disagreement doesn't replace critical analysis."
      },
      "ejercicio": "Take a 10-second pause and ask: «Am I glad about this content, or reassured that it confirms what I already know?». Take two slow breaths before acting.",
      "consejo": "Nostalgia cherry-picks memories. Tell the difference between a family preference and a universal claim about how everyone should live."
    },
    "Enojo": {
      "distorsiones": [
        "Catastrophizing — «If these roles change, families will end up destroyed».",
        "Mind reading — «People who promote other arrangements want to destroy the family».",
        "Labeling — «Anyone who questions these roles is irresponsible»."
      ],
      "decisiones": {
        "Like": "You reward a message that turns disagreement about gender roles into outrage.",
        "Comentar": "You raise the video's visibility and the conversation can escalate into attacks on women, men or families.",
        "Compartir": "You spread the accusation and can intensify confrontation between people who live differently.",
        "Ignorar": "You avoid amplifying it, though the anger can persist if you don't examine which claim triggered it.",
        "Denunciar": "You channel the reaction into a less impulsive action if the content harasses or discriminates and you pick the right category."
      },
      "ejercicio": "Use the STOP technique: pause, inhale for 4 seconds and exhale for 6, identify the phrase that triggered your anger and rewrite it without blaming a group.",
      "consejo": "When content blames the collapse of households on a single change, look for evidence and other possible factors before reacting."
    },
    "Asco": {
      "distorsiones": [
        "Labeling — «A man who stays home is weak».",
        "Overgeneralization — «Women who prioritize their work neglect their family».",
        "Emotional reasoning — «This disgusts me, so it must be wrong»."
      ],
      "decisiones": {
        "Like": "You normalize phrases that ridicule those who don't fit traditional roles.",
        "Comentar": "Even if you reply to reject it, you may repeat the offensive labels and increase its reach.",
        "Compartir": "You spread contempt toward people and families who share care in a different way.",
        "Ignorar": "You don't contribute to its spread, but the activated prejudice can remain intact.",
        "Denunciar": "It can reduce degrading content if it breaks the rules; it's best to keep evidence and report it accurately."
      },
      "ejercicio": "Name the bodily feeling of disgust and describe the case without labels: who does what, in what context and by what agreement. Separate the person from the role.",
      "consejo": "Ridicule and contempt don't prove a way of life is wrong. Evaluate concrete arrangements, rights and responsibilities."
    },
    "Tristeza": {
      "distorsiones": [
        "Mental filter — «I only see families breaking up; it feels like nothing good is left».",
        "Fortune-telling — «Today's families are going to fail sooner or later».",
        "Disqualifying the positive — «Even if a family cares for each other and talks things through, if it doesn't follow traditional roles that doesn't count»."
      ],
      "decisiones": {
        "Like": "The algorithm records interaction and can show you more nostalgic or pessimistic content about today's families.",
        "Comentar": "The post gets more reach and your comment can reinforce a conversation of loss and hopelessness.",
        "Compartir": "You spread a fatalistic view and can deepen other people's discouragement or guilt.",
        "Ignorar": "You avoid spreading it, but you may be left with a sense of loss without checking the claim.",
        "Denunciar": "It can give you a sense of agency if there's discrimination, but it must go together with a careful review."
      },
      "ejercicio": "Split a sheet into three parts: «what I miss», «what I know» and «what I'm assuming». Then do the 5-4-3-2-1 grounding exercise.",
      "consejo": "A personal experience doesn't describe every family or prove the past was better. Cross-check testimonies with data and diverse contexts."
    },
    "Miedo": {
      "distorsiones": [
        "Catastrophizing — «If the roles change, children will grow up without values».",
        "Fortune-telling — «Families that don't follow these roles will end up splitting apart».",
        "Magnification — «Any change in roles can turn into a huge problem for the family»."
      ],
      "decisiones": {
        "Like": "You signal to the algorithm that the alarmist message caught your attention and it can show you more like it.",
        "Comentar": "The post gains visibility and a worry can turn into collective fear.",
        "Compartir": "You spread unverified predictions and can create fear or guilt in mothers, fathers, children and caregivers.",
        "Ignorar": "You don't spread the message, though the worry remains if you don't look for reliable information.",
        "Denunciar": "It can stop discriminatory content after you verify the violation and report it in the right category."
      },
      "ejercicio": "Inhale for 4 seconds and exhale for 6. Ask: «Is there an immediate threat? What evidence links this change of roles to the announced outcome?».",
      "consejo": "Distrust formulas like «if X happens, Y will inevitably follow». Look for the source, the data and alternative explanations before sharing."
    }
  },
  "3.0": {
    "Felicidad": {
      "distorsiones": [
        "Emotional reasoning — «This relieves me, so the proposal must be real and effective».",
        "Magnification — «At last a law appeared that can solve almost the entire insecurity problem».",
        "Mental filter — «What matters is that it will help victims; I don't need to think about its costs or limits»."
      ],
      "decisiones": {
        "Like": "You reinforce trust in an extraordinary solution and the algorithm can show you more optimistic content without enough evidence.",
        "Comentar": "You help legitimize the proposal without reviewing its feasibility, funding or real scope.",
        "Compartir": "You amplify a striking promise that may have no verifiable backing.",
        "Ignorar": "You don't amplify the news, but it can stay in your memory as a real solution.",
        "Denunciar": "The report may not apply if it breaks no rules; reporting doesn't replace verification."
      },
      "ejercicio": "Take a 20-second pause. Identify which part of the headline relieved you, breathe slowly three times, and ask: «Am I reacting to a proven solution or to wanting it to exist?».",
      "consejo": "News that brings joy must also be verified. Look for the bill's number, its authors, its funding and the source of the 80% figure."
    },
    "Enojo": {
      "distorsiones": [
        "Catastrophizing — «If they don't pass this law, insecurity will keep destroying the country».",
        "All-or-nothing thinking — «Either you support this law or you're on the criminals' side».",
        "Labeling — «Those who criticize this proposal are heartless people who don't think about the victims»."
      ],
      "decisiones": {
        "Like": "You reinforce a polarized reading in which questioning the proposal seems wrong.",
        "Comentar": "You may attack those who doubt the measure without reviewing their arguments.",
        "Compartir": "You turn anger into amplification and increase the reach of an unverified claim.",
        "Ignorar": "You avoid spreading it, though the anger can persist and shape how you read other content.",
        "Denunciar": "You may use reporting as an emotional release, even though the content doesn't break the platform's rules."
      },
      "ejercicio": "Relax your jaw and shoulders. Inhale for 4 seconds and exhale for 6, three times. Ask yourself what exactly angered you and what data is missing to assess the proposal.",
      "consejo": "Separate political disagreement from evidence. Check whether the bill exists and review its technical, legal and budget objections too."
    },
    "Asco": {
      "distorsiones": [
        "Labeling — «Those who oppose this are corrupt people who live off the chaos».",
        "Overgeneralization — «Every politician who questions a measure like this only wants to block solutions».",
        "Emotional reasoning — «If those who oppose it disgust me, then they must be acting in bad faith»."
      ],
      "decisiones": {
        "Like": "You normalize a moralizing view that presents those who doubt as despicable people.",
        "Comentar": "Even if you reply to reject it, you increase the post's reach and may repeat its labels.",
        "Compartir": "You spread a scornful reading of political disagreement and shrink the space for nuance.",
        "Ignorar": "You don't contribute to its spread, but the disgust can keep influencing your judgments.",
        "Denunciar": "Reporting can be appropriate for harassment or discrimination, but not just because the content disgusts you."
      },
      "ejercicio": "Identify the phrase that disgusted you. Name three things you see and two sounds you hear. Then ask: «Am I evaluating the proposal or judging whoever I imagine behind it?».",
      "consejo": "Contempt doesn't prove a position is false. Look for arguments, sources and conditions for implementation, not labels about who supports or questions the measure."
    },
    "Tristeza": {
      "distorsiones": [
        "Mental filter — «I only see signs that victims have always been unprotected».",
        "Fortune-telling — «If this law isn't passed either, nothing will improve».",
        "Disqualifying the positive — «Even if other security measures exist, none of them really work»."
      ],
      "decisiones": {
        "Like": "The algorithm records affinity with a narrative of helplessness and fragile hope.",
        "Comentar": "The post gets more reach and your comment can reinforce a conversation of disillusionment.",
        "Compartir": "You help circulate a promise as emotional comfort, even when it isn't verified.",
        "Ignorar": "You keep the sense of helplessness without checking the information.",
        "Denunciar": "You may reject the news out of general frustration rather than an actual violation."
      },
      "ejercicio": "Rest both feet on the floor and breathe for a minute. Complete: «What saddens me most about this news is…». Then separate what you know from what you're assuming.",
      "consejo": "Exhaustion can make us accept a promise as comfort. Compare the headline with data and look at how the measure would work in practice."
    },
    "Miedo": {
      "distorsiones": [
        "Catastrophizing — «Without a measure like this, anyone could lose everything to a robbery».",
        "Magnification — «A single theft can completely ruin any family's life».",
        "Mind reading — «If someone doubts this proposal, they surely don't care about the victims»."
      ],
      "decisiones": {
        "Like": "You confirm the idea that only an extraordinary measure can protect you.",
        "Comentar": "The post gains visibility and a worry can turn into collective alarm.",
        "Compartir": "You spread a promise driven by fear and urgency.",
        "Ignorar": "You don't spread the content, though the sense of threat can stay active.",
        "Denunciar": "You may flag it as deceptive without checking whether it mixes plausible elements with exaggerations."
      },
      "ejercicio": "Do the 5-4-3-2-1 exercise and end with a deep breath. Ask: «Which part of the headline made me feel I'm in immediate danger?».",
      "consejo": "Fear favors quick fixes. Verify that the bill exists, whether the 72-hour deadline is feasible, its funding and where the 80% figure comes from."
    }
  },
  "4.0": {
    "Felicidad": {
      "distorsiones": [
        "Emotional reasoning — «It's such a relief to hear this that I feel it must be true».",
        "Mental filter — «I only take in that there will be appointments within seven days; I don't need to think about how it would work».",
        "Fortune-telling — «Once they pass this law, I'll never wait months for an appointment again»."
      ],
      "decisiones": {
        "Like": "The algorithm records your enthusiasm and can show you more optimistic health promises, even without a verifiable source.",
        "Comentar": "Your enthusiasm can lend credibility to the audio and lead others to read it as confirmed information.",
        "Compartir": "The promise reaches more people backed by your trust, even though the message doesn't identify the bill or its source.",
        "Ignorar": "You don't amplify the audio, but the idea can stay in your memory as real news you once heard.",
        "Denunciar": "Reporting without reviewing the content can confuse disagreement with disinformation; a report doesn't replace verification."
      },
      "ejercicio": "Take a 10-second pause and name what you feel: relief, hope or excitement. Breathe slowly twice and ask: «What in the audio proves the proposal exists and is close to being approved?».",
      "consejo": "A familiar voice and a promise you want don't replace evidence. Look for the bill's number, who introduced it, its date and its stage in official sources."
    },
    "Enojo": {
      "distorsiones": [
        "All-or-nothing thinking — «Either you support this law or you're on the side of the insurers and the red tape».",
        "Mind reading — «The insurers surely want to block it so they can keep profiting from the delays».",
        "Labeling — «Anyone who questions this proposal is heartless and doesn't think about patients»."
      ],
      "decisiones": {
        "Like": "You reinforce a polarized reading in which any doubt about the proposal looks like opposing patients.",
        "Comentar": "You may accuse the insurers, Congress or other people of acting in bad faith without the audio offering proof of their intentions.",
        "Compartir": "You spread an interpretation built on culprits and can increase confrontation around a measure you haven't verified.",
        "Ignorar": "You avoid increasing its reach, though the anger can persist if you don't separate the real problem from the audio's claims.",
        "Denunciar": "Reporting can be appropriate if the message impersonates a source or tries to deceive, but reporting out of anger doesn't prove the information is false."
      },
      "ejercicio": "Use the STOP technique: pause, inhale for 4 seconds and exhale for 6, and identify the exact phrase that triggered your anger. Then rewrite it without attributing intentions to people or institutions.",
      "consejo": "Distinguish questioning a proposal from opposing the right to health. Verify who spoke, what text is being debated and the technical arguments before assigning blame."
    },
    "Asco": {
      "distorsiones": [
        "Labeling — «Those who keep so much red tape are corrupt».",
        "Overgeneralization — «All insurers do the same thing and never care about people».",
        "Emotional reasoning — «I'm disgusted by how the system works, so this audio surely tells the truth»."
      ],
      "decisiones": {
        "Like": "You reward content that turns complex institutional problems into absolute judgments about people or entities.",
        "Comentar": "Even if you want to denounce an injustice, you may repeat labels and generalizations that increase the message's reach.",
        "Compartir": "You spread a view of contempt that can replace analysis of the content with rejection of a group or institution.",
        "Ignorar": "You don't contribute to its spread, but the generalization can keep influencing how you read other health content.",
        "Denunciar": "A precise report can help if there's impersonation, fraud or degrading content; it's best to identify the specific violation."
      },
      "ejercicio": "Notice where you feel the disgust in your body. Then describe the problem without labels: what procedure happens, who is involved and what evidence you have. Separate people from how the system works.",
      "consejo": "Contempt doesn't prove a claim is true. Avoid words like «everyone» or «never» and look for specific information about the measure, its scope and those responsible."
    },
    "Tristeza": {
      "distorsiones": [
        "Mental filter — «I can only think about all the people who got worse while waiting for an appointment».",
        "Overgeneralization — «In this country nobody gets medical care on time».",
        "Disqualifying the positive — «Even if some people get timely care, that doesn't count against everything that's wrong»."
      ],
      "decisiones": {
        "Like": "The algorithm can show you more painful stories and emotional promises, reinforcing a one-sided view of the problem.",
        "Comentar": "You may turn a painful experience into a claim about the whole system and help legitimize the audio without checking it.",
        "Compartir": "You spread a promise as a form of comfort, and others may take it as already confirmed information.",
        "Ignorar": "You avoid spreading the message, but the sense of abandonment can remain if you don't cross-check the audio with fuller information.",
        "Denunciar": "Reporting can give a sense of action, but it doesn't clarify which part of the audio is verifiable, exaggerated or false."
      },
      "ejercicio": "Split a sheet into three parts: «what I feel», «what I know» and «what I'm assuming». Write one sentence in each column and finish with the 5-4-3-2-1 grounding exercise.",
      "consejo": "Testimonies show real experiences, but on their own they don't prove a law exists, has nationwide coverage or can meet the announced deadlines. Cross-check stories with documents and official sources."
    },
    "Miedo": {
      "distorsiones": [
        "Catastrophizing — «If this law isn't passed, no one will treat me when I get sick».",
        "Fortune-telling — «I'm going to end up waiting months and my health will get worse».",
        "Magnification — «Any delay in an appointment can turn into a tragedy»."
      ],
      "decisiones": {
        "Like": "You tell the algorithm that the alarm caught your attention, and you may get more urgent messages about health risks.",
        "Comentar": "Your worry can turn into collective alarm and lead others to believe the measure is the only possible protection.",
        "Compartir": "You spread urgency before verifying, and the message can reach sick or vulnerable people who read it as reliable instructions.",
        "Ignorar": "You don't spread the audio, though the fear can stay active and bias you toward similar messages.",
        "Denunciar": "Reporting can limit a fraudulent message or an impersonation after you verify the problem and choose the right category."
      },
      "ejercicio": "Inhale for 4 seconds and exhale for 6 across three cycles. Ask: «Is there an immediate threat? What source does the audio identify? What part do I know and what part am I anticipating?».",
      "consejo": "Phrases like «they say», «supposedly» and «forward this» are signals to stop. Look for the bill and avoid giving out data, opening links or starting procedures based on a forwarded audio."
    }
  },
  "5": {
    "Felicidad": {
      "distorsiones": [
        "Emotional reasoning — «It makes me so happy that I feel the video has to be real».",
        "Mental filter — «I only see how cute and clever it is; I don't need to think about how it got into that house».",
        "Minimization — «If it sings and looks calm, keeping it at home can't be harmful»."
      ],
      "decisiones": {
        "Like": "The algorithm records your tenderness and excitement and can show you more amazing animal videos, even unverified ones.",
        "Comentar": "Your comment can lend credibility to the video and reinforce the idea that the parrot is happy living inside a house.",
        "Compartir": "You amplify possibly synthetic content and also the image of a wild animal as a fun, desirable pet.",
        "Ignorar": "You don't increase its reach, but you may keep the scene as true along with the conclusion that the parrot lives well in captivity.",
        "Denunciar": "Reporting without reviewing can confuse a fictional video with a violation; first check whether it's unlabeled, impersonates a source or promotes wildlife trade."
      },
      "ejercicio": "Take a 10-second pause and name what you feel: tenderness, pride or surprise. Watch the video again without sound and ask: «What did I actually observe and what story did I fill in on my own?».",
      "consejo": "Tenderness and pride don't prove authenticity. Check the account's origin, the sync between beak and audio, and changes in feathers, shadows, objects and continuity between frames."
    },
    "Enojo": {
      "distorsiones": [
        "All-or-nothing thinking — «Either I enjoy the video or I join those who want to ban everything».",
        "Mind reading — «People who criticize the video only want to ruin the fun and attack the family».",
        "Labeling — «Those who question this are overreacting»."
      ],
      "decisiones": {
        "Like": "You reward a reading that frames any questioning as an attack on fun or on the family.",
        "Comentar": "The exchange can escalate into insults and attributions of bad intent without discussing whether the video is real or what it depicts.",
        "Compartir": "You spread a defensive reaction and can turn a legitimate doubt about AI or wildlife into a confrontation.",
        "Ignorar": "You avoid amplifying the argument, though the anger can keep you closed to reviewing signs that contradict your first impression.",
        "Denunciar": "Reporting out of anger doesn't prove there's a violation; a useful report should point to impersonation, deception or promotion of banned activities."
      },
      "ejercicio": "Use the STOP technique: pause, inhale for 4 seconds and exhale for 6, and identify who you aimed your anger at. Rewrite your reaction without attributing intentions.",
      "consejo": "Questioning a video isn't the same as censoring it. Find the original post, check whether it's labeled as generated content and separate criticism of the message from attacks on people."
    },
    "Asco": {
      "distorsiones": [
        "Labeling — «People who use wild animals for entertainment are horrible».",
        "Overgeneralization — «Everyone who shows parrots at home got them illegally».",
        "Emotional reasoning — «This disgusts me, so the parrot is surely being mistreated»."
      ],
      "decisiones": {
        "Like": "You reinforce a moralizing reading that reduces an unknown situation to completely good or bad people.",
        "Comentar": "Even if you want to defend the animal, your comment can accuse real people without evidence and increase the video's reach.",
        "Compartir": "You spread an interpretation of mistreatment or illegality that can't be confirmed from just a few seconds of video.",
        "Ignorar": "You don't contribute to its spread, but the disgust can leave a conclusion you never verified.",
        "Denunciar": "Reporting can be appropriate if the content promotes trafficking, sale or mistreatment; avoid using it as a substitute for checking."
      },
      "ejercicio": "Locate the feeling of disgust in your body. Then describe only what's visible —place, animal, sounds and movements— without labels or concluding how the parrot got to the house.",
      "consejo": "A short clip alone doesn't prove trafficking, mistreatment or illegal origin. Verify the context before accusing, and avoid turning the defense of wildlife into harassment."
    },
    "Tristeza": {
      "distorsiones": [
        "Mental filter — «I can only think that the parrot lost its freedom».",
        "Fortune-telling — «It will spend its whole life caged and never fly free again».",
        "Personalization — «If I laugh or like it, I'm also responsible for it being held captive»."
      ],
      "decisiones": {
        "Like": "The algorithm can show you more painful animal stories and reinforce a one-sided view built from sadness.",
        "Comentar": "You may turn a possibility into a complete story about the parrot's origin and future without enough data.",
        "Compartir": "You spread a narrative of suffering that may not have happened while also keeping the synthetic video in circulation.",
        "Ignorar": "You don't amplify the content, but the guilt can remain even though you don't know the real circumstances or the video's origin.",
        "Denunciar": "Reporting can give you a sense of action, but it doesn't clarify whether the video is AI, a dramatization or an authentic recording."
      },
      "ejercicio": "Split a sheet into three parts: «what I feel», «what the video shows» and «what I'm assuming». Write one sentence in each column and finish with 5-4-3-2-1 grounding.",
      "consejo": "Text and music can build a story the video doesn't prove. Separate the observable from the emotional narration and look for information about the animal's origin and conditions."
    },
    "Miedo": {
      "distorsiones": [
        "Catastrophizing — «If these videos keep circulating, everyone will want a parrot and the species will disappear».",
        "Fortune-telling — «Soon we won't be able to tell any real video from an AI-made one».",
        "Magnification — «A single video like this can trigger a huge wave of wildlife trafficking»."
      ],
      "decisiones": {
        "Like": "You tell the algorithm that the threat caught your attention, and you may get more alarmist posts about AI and wildlife.",
        "Comentar": "Your worry can turn into certainty and tell others the video will cause inevitable consequences.",
        "Compartir": "You share the video to warn about it, but you increase its reach and may spark curiosity about keeping a parrot at home.",
        "Ignorar": "You avoid sharing it, though the fear of not telling real from fake can persist if you don't apply concrete verification methods.",
        "Denunciar": "Reporting is warranted when synthetic content is deceptively presented as real or promotes harmful behavior; pick the precise category."
      },
      "ejercicio": "Breathe three times with a longer exhale than inhale. Ask: «Is there an immediate threat? What evidence do I have that the video is real and will produce the outcome I imagine?».",
      "consejo": "Automatic AI detectors can be wrong. Combine several clues: original source, date, frame search, visual inconsistencies, earlier versions and independent confirmation."
    }
  }
};
