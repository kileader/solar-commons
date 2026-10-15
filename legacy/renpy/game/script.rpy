define m = Character("Mara", who_color="#ffc8a5", image="mara")
define k = Character("Kite", who_color="#a1f4d8", image="kite")

image bg harbor = "images/harbor.webp"
image bg museum = "images/museum/02_main_hall.webp"
image bg museum_exterior = "images/museum/01_hall_exterior.webp"
image bg museum_exhibit = "images/museum/03_flood_exhibit.webp"
image bg museum_model = "images/museum/05_city_scale_model.webp"
image side mara = "images/mara-cybernetic.webp"
image side kite = "images/kite.svg"

default inspected = []
default entry_choice = None
default harbor_ending = None
default lead_choice = None
default perception = False
default exhibit_read = False
default discovered = False
default location = "The Harbor"
default flood_stage = 0
default gate_open = False
default reconstruction_seen = False

init python:
    import json
    with renpy.file("content/harbor.json") as source:
        harbor_content = json.load(source)
    with renpy.file("content/museum.json") as source:
        museum_content = json.load(source)
    harbor_clues = {clue["id"]: clue for clue in harbor_content["clues"]}
    exhibit = museum_content["historicalExhibit"]
    record = museum_content["refugeRecord"]

label splashscreen:
    scene expression Solid("#000")
    show expression "images/phicid_logo.png" at studio_logo
    with Dissolve(0.4)
    pause 1.8
    hide expression "images/phicid_logo.png"
    with Dissolve(0.3)
    return

label start:
    call opening from _call_opening
    call harbor from _call_harbor
    call museum_chapter from _call_museum_chapter
    return

label museum_chapter:
    call museum from _call_museum
    hide screen scene_hud
    label .finish:
        call screen chapter_complete
        if _return == "revisit":
            call museum_reconstruction from _call_revisit_reconstruction
            hide screen scene_hud
            jump museum_chapter.finish
    return

label harbor:
    $ location = "The Harbor"
    scene bg harbor at background_fit
    show screen scene_hud
    show screen perception_overlay
    play music "audio/commons.ogg" fadein 1.0
    call harbor_intro from _call_harbor_intro
    call harbor_entry from _call_harbor_entry
    k "Let’s look at the three readings. You can open our shared perception whenever you like."
    label .investigate:
        call screen harbor_explore
        if _return == "conclude":
            if len(inspected) == 3:
                jump harbor.decide
            jump harbor.investigate
        $ clue_id = _return
        if clue_id in harbor_clues:
            if clue_id not in inspected:
                $ inspected = inspected + [clue_id]
            play sound "audio/inspect.wav"
            call screen evidence(clue_id)
            call expression "clue_" + clue_id from _call_clue
        jump harbor.investigate
    label .decide:
        call harbor_conclusion from _call_harbor_conclusion
        hide screen optical_emission
        $ perception = False
        call screen harbor_departure
        return

label museum:
    $ location = "Hall of Waters"
    $ perception = False
    scene bg museum_exterior at background_fit
    with Dissolve(0.4)
    show screen scene_hud
    "The Hall of Waters stands above the harbor in a tangle of sunlit glass and climbing plants. Its old pumps have outlived the contracts that once controlled them."
    scene bg museum at background_fit
    with Dissolve(0.3)
    call museum_arrival from _call_museum_arrival
    label .explore:
        call screen museum_explore
        if _return == "history":
            $ exhibit_read = True
            scene bg museum_exhibit at background_fit
            call screen history_exhibit
            scene bg museum at background_fit
            jump museum.explore
        if _return != "model":
            jump museum.explore
    call museum_reconstruction from _call_museum_reconstruction
    $ perception = False
    return

label museum_reconstruction:
    $ location = "Hall of Waters"
    scene bg museum_model at background_fit
    show screen scene_hud
    if not reconstruction_seen:
        m "A whole miniature city, and they’ve given me the flood controls. My school-trip privileges have improved."
        k "The residents are brass. I have checked."
    $ reconstruction_seen = True
    label .try_again:
        call screen flood_reconstruction
        if _return == "leave":
            k "We can come back. The exhibit is a reconstruction, not an exam."
            return
        if _return != "lamp":
            jump museum_reconstruction.try_again
    if not discovered:
        if gate_open:
            m "I opened the gates to spare the streets. That admits the sea. There isn’t a clever setting that keeps both waters out, is there?"
        else:
            m "Keeping the gates shut buys time against the tide. Then the rain has nowhere to go. That’s a horrible pair of choices."
        k "The crews took local control of the pumps and ferries. The model compresses many decisions into one turning point. But look at dawn: that lamp isn’t part of its water simulation."
        m "The last ferry has gone. Why is there still a light in the refuge?"
        k "An entry in the reproduced handover log. Recorded then, not predicted by the model. There’s a maintenance drum underneath the display."
        call museum_discovery from _call_reconstruction_discovery
        call museum_lead from _call_reconstruction_lead
    else:
        show screen refuge_record
        k "Still a record of a lamp and an attended line. Still no name. We have our next step."
        hide screen refuge_record
    return

transform background_fit:
    xysize (1600, 900)
    fit "cover"

transform studio_logo:
    xalign 0.5
    yalign 0.5
    xysize (480, 480)
    fit "contain"

transform portrait_fit:
    xysize (210, 245)
    fit "contain"

transform opening_drift:
    xalign 0.5
    yalign 0.5
    xysize (1600, 900)
    fit "cover"
    zoom 1.0
    linear 6.0 zoom 1.035
