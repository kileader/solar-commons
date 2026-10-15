# Authored dialogue carried from the React prototype; native Ren'Py labels and menus.

label harbor_intro:
    "The harbor terraces catch the last warm light. Ferries slip between floating gardens; somewhere above the water, a school choir is losing an argument with the gulls."
    m "Kite. I can feel where you’re looking. Is that going to happen every time I stop thinking about it?"
    k "Only while you let me. Twelve years sharing your attention, and today you finally gave me a window. I’d rather start with something beautiful."
    k "The maintenance float found a shape beneath the old breakwater. Its bracing resembles work from before the Unbinding. Resemblance is not a date. Open Cognitive Perception when you’re ready, and we’ll look together."
    return

label harbor_entry:
    menu:
        "How do we begin?"
        "Show me what we actually know.":
            $ entry_choice = "trace"
            m "No ghosts yet. Give me the measurements before we give it a history."
            k "Gladly. Open our shared perception when you’re ready. Solid traces are observations; broken traces are my models. Three readings, and none of them tells the whole story."
        "Let me see the harbor with you.":
            $ entry_choice = "listen"
            m "All right. Show me how you see this place. Slowly."
            k "Use our shared perception. We’ll keep the city underneath it. Solid traces are things we measured; broken traces are things I’m trying to explain. You can close the window whenever you want."
    return

label clue_geometry:
    m "It looks deliberate. Like something folded and put away."
    k "That is a good description of the shape. It is not yet a description of what happened here."
    return

label clue_thermal:
    m "For a moment I thought it was breathing."
    k "So did I. Then I checked the current. We can feel something before we understand it, as long as we remember the difference."
    return

label clue_archive:
    m "My grandmother called this the place the city learned to listen. I thought she meant the assemblies after the Unbinding."
    k "Perhaps she did. A gap in a survey is a reason to measure again, Mara. It is not a secret merely because we want one."
    return

label harbor_conclusion:
    menu:
        "What should we do next?"
        "Let’s map it without disturbing it.":
            $ harbor_ending = "survey"
            m "A full sonar pass, current measurements, and a look through the maintenance records. No digging. If it has been here all this time, it can survive a few more careful questions."
            k "I’ll assemble the survey plan with the harbor cooperative. We can measure what we need without lifting the frame. Whatever this is, it shares a harbor with a great many living things."
            "You save the plan together. Above the hidden frame, a ferry opens its doors and the evening crowd spills into the light. For once, leaving a question open feels like making room."
        "Send a quiet introduction.":
            $ harbor_ending = "handshake"
            m "Use the probe’s inspection lamp. One brief blue pulse. If there is anything down there that can see it, let it see us arrive quietly."
            show screen optical_emission
            k "Pulse sent. The probe camera registered three faint points of light about 0.8 seconds later. I’m logging a delayed emission. It could be unrelated; we haven’t established a reply."
            "The three points fade from the camera feed. You stay by the rail a little longer. It is a strange thing, to wonder whether you have just passed a neighbor in the dark."
    return

label museum_arrival:
    if harbor_ending == "handshake":
        "The Hall of Waters is one terrace above the harbor. Inside, afternoon light slips across a brass tide model. A blue flood line cuts through a painted family picnic."
        k "I’ve kept the three lights in our notes. Before we decide they were saying hello, there’s something here about the old breakwater."
        m "My grandmother brought me here. I remember the flood line, the ferry bell, and being told not to climb into the model."
        k "A remarkably specific instruction."
        m "A remarkably climbable model. Come on. Let’s see what they left out of the school trip."
    else:
        "The Hall of Waters is one terrace above the harbor. Inside, afternoon light slips across a brass tide model. A blue flood line cuts through a painted family picnic."
        k "The survey plan is saved. While the cooperative considers it, this gallery has a record of the old breakwater."
        m "My grandmother brought me here. I remember the flood line, the ferry bell, and being told not to climb into the model."
        k "A remarkably specific instruction."
        m "A remarkably climbable model. Come on. Let’s see what they left out of the school trip."
    return

label museum_discovery:
    m "Twelve years in my ear and you finally take me somewhere with a secret compartment."
    k "An inspection mirror. It has a label."
    "You tilt the visitor mirror. Beneath the grand dedication, the replica maintenance drum carries another ending."
    $ discovered = True
    play sound "audio/discovery.wav"
    show screen refuge_record
    if harbor_ending == "handshake":
        m "“Refuge held from within.” Wait. The big inscription says the last ferry brought the city home. This says someone was still down there."
        k "And keeping a line open. The model’s refuge has six support ribs. The spacing on its scale is compatible with our sonar frame."
        m "So we may have found the place that kept them alive. And the grand public ending left out whoever stayed."
        k "It gives us a place to look. It doesn’t tell us who stayed, for how long, or what made those lights today. I would very much like to know who “attended” means."
        m "Grandma called this the place the city learned to listen. Maybe she was being literal. East service stair. That’s a better lead than “something vaguely rib-shaped.”"
    else:
        m "“Refuge held from within.” Wait. The big inscription says the last ferry brought the city home. This says someone was still down there."
        k "And keeping a line open. The model’s refuge has six support ribs. The spacing on its scale is compatible with our sonar frame."
        m "So we may have found the place that kept them alive. And the grand public ending left out whoever stayed."
        k "It gives us a place to look. It doesn’t date our frame or explain the warm water. I would very much like to know who “attended” means."
        m "Grandma called this the place the city learned to listen. Maybe she was being literal. East service stair. That’s a better lead than “something vaguely rib-shaped.”"
    hide screen refuge_record
    return

label museum_lead:
    menu:
        "Someone stayed below. What do we follow?"
        "Follow the listening line.":
            $ lead_choice = "stair"
            m "Put the stair in the survey request. Ask the cooperative for safe shore access and a continuity check on the old line. We can start without touching the frame."
            k "Added, with the handover record attached. “Possibly significant refuge.” I have resisted “secret underwater neighbor.”"
            "Your next step is on the shore now: an east stair, a cable route, a question that can be tested. Mara rests a hand on the model’s cool brass. For the first time, the shape below the harbor has somewhere to lead."
        "Find the missing voice.":
            $ lead_choice = "voices"
            m "Ask the collection keeper for the refuge testimony. Names, shift lists, anything the dedication couldn’t fit. Someone ought to get remembered before we go knocking."
            k "Request saved with the record attached. Under your name. Apparently I am still listed as your “educational accessory.”"
            m "We’ll correct that too. Come on, educational accessory. Let’s find out who kept the city company in the dark."
    return
