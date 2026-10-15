style default:
    font "DejaVuSans.ttf"
    size 26
    color "#edf4e7"
style heading:
    size 48
    color "#fff2d4"
style subheading:
    size 29
    color "#adebd5"
style fine_print:
    size 20
    color "#bfcec7"
style action_button:
    background Solid("#163f48ed")
    hover_background Solid("#31645cf5")
    insensitive_background Solid("#17383b99")
    selected_background Solid("#35685df5")
    padding (24, 17)
style action_button_text:
    size 25
    hover_color "#ffdfa3"
    insensitive_color "#728b88"
    selected_color "#ffe0a4"
style panel_frame:
    background Solid("#102d36fa")
    padding (42, 30)
style bar:
    ysize 22
    left_bar Solid("#b6e4c7")
    right_bar Solid("#36565c")
    thumb Solid("#ffe1a5")
    thumb_offset 8
style scrollbar:
    xsize 14
    base_bar Solid("#36565c")
    thumb Solid("#b6e4c7")
style vscrollbar:
    xsize 14
    base_bar Solid("#36565c")
    thumb Solid("#b6e4c7")

screen main_menu():
    tag menu
    add "images/harbor.webp" at background_fit
    add Solid("#07262ba8")
    frame:
        style "panel_frame"
        xpos 110 ypos 170 xsize 750
        vbox:
            spacing 22
            text "PHICID PRODUCTIONS" style "fine_print"
            text "Solar Commons" size 76 color "#fff1d2"
            text "A shared point of view.\nA city with unfinished stories." size 30
            null height 10
            textbutton "Begin the story" action Start() style "action_button" id "begin_story"
            textbutton "Load a save" action ShowMenu("load") style "action_button"
            textbutton "Preferences" action ShowMenu("preferences") style "action_button"
            text "Harbor → Hall of Waters · about 15 minutes" style "fine_print"
    text "An authored, offline story. No AI service or account required." xpos 110 ypos 838 style "fine_print"

screen say(who, what):
    window:
        id "window"
        background Solid("#0b2734f2")
        xfill True yalign 1.0 ysize 284
        hbox:
            xpos 65 ypos 22 spacing 34
            add SideImage() at portrait_fit
            vbox:
                spacing 12 xsize 1200
                if who:
                    text who id "who" size 27 color "#b9f9dc"
                text what id "what" size (35 if persistent.large_text else 30) line_spacing 5 xmaximum 1190
    textbutton "Continue  ›" action Return() style "action_button" xalign 0.94 yalign 0.955

screen choice(items):
    modal True
    add Solid("#08283275")
    frame:
        style "panel_frame"
        xalign 0.62 yalign 0.44 xsize 1040
        vbox:
            spacing 18
            text "YOUR CHOICE" style "fine_print"
            for i, item in enumerate(items):
                textbutton item.caption:
                    action item.action
                    style "action_button"
                    xfill True
                    id ("choice_" + str(i))
                    keysym ("K_" + str(i + 1))

screen scene_hud():
    zorder 40
    key "K_c" action ToggleVariable("perception")
    key "K_j" action Show("field_notes")
    frame:
        background Solid("#0a2b36b0")
        xfill True ysize 92
        hbox:
            xpos 60 ypos 22 spacing 35
            text "SOLAR COMMONS" size 26 color "#ffe4b6"
            text "[location]" size 28
        hbox:
            xalign 0.97 yalign 0.5 spacing 10
            textbutton ("Perception: on" if perception else "Perception") action ToggleVariable("perception") style "action_button" text_size 20
            textbutton "Notes" action Show("field_notes") style "action_button" text_size 20
            textbutton "Menu" action ShowMenu("preferences") style "action_button" text_size 20
    hbox:
        xalign 0.97 ypos 865 spacing 22
        textbutton "Back" action Rollback() text_size 19
        textbutton "History" action ShowMenu("history") text_size 19
        textbutton "Save" action ShowMenu("save") text_size 19
        textbutton "Load" action ShowMenu("load") text_size 19
screen perception_overlay():
    zorder -5
    if perception and location == "The Harbor":
        use harbor_perception
    elif perception and location == "Hall of Waters":
        frame:
            background Solid("#0b323edb")
            xpos 640 ypos 122 padding (22, 14)
            text "Shared attention · the worn brass rim" size 23 color "#b9ffe7"

screen optical_emission():
    zorder -4
    vbox:
        xpos 980 ypos 490 spacing 10
        text "•   •   •" size 48 color "#bffff0" outlines [(5, "#6cd9cd50", 0, 0)]
        text "Observed · delayed light" size 21 color "#d4ffee" outlines [(2, "#123d40", 0, 0)]

screen harbor_perception():
    add Solid("#063a4950")
    add "images/harbor-perception.svg" ypos 92 xysize (1600, 800)
    frame:
        background Solid("#0c343ecf")
        xpos 1020 ypos 110 xsize 510 padding (24, 20)
        vbox:
            spacing 16
            text "KITE · SHARED PERCEPTION" style "fine_print"
            text "Observed: six sonar ribs" style "subheading"
            text "14.2 m below datum · +0.18 ± 0.05 °C" size 23
            text "- - - Partial reconstruction - - -" color "#edcf96" size 23
            text "Solid: observations · dashed: models\nFar surfaces unresolved. Patterns are not proof." size 21

screen harbor_explore():
    modal True
    for clue in harbor_content["clues"]:
        $ cx = int(clue["position"]["x"] * 14)
        $ cy = int(clue["position"]["y"] * 8)
        textbutton (("✓ " if clue["id"] in inspected else "○ ") + harbor_content["sceneCopy"]["clueLabels"][clue["id"]]):
            xpos cx ypos cy
            style "action_button"
            action Return(clue["id"])
            id clue["id"]
    frame:
        style "panel_frame"
        xpos 65 ypos 675 xsize 1470
        vbox:
            spacing 12
            text (harbor_content["sceneCopy"]["synthesis"] if len(inspected) == 3 else "Three readings from the harbor. Choose a marker to look closer.") size 28
            hbox:
                spacing 26
                text "[len(inspected)] of 3 readings recorded" style "fine_print" yalign 0.5
                textbutton "Decide together" action Return("conclude") sensitive len(inspected) == 3 style "action_button" id "conclude"
                textbutton "Shared perception" action ToggleVariable("perception") style "action_button"

screen reading_panel(title, subtitle="", close_action=Return()):
    modal True
    zorder 100
    key "game_menu" action close_action
    add Solid("#031d29c9")
    frame:
        style "panel_frame"
        xalign 0.5 yalign 0.5 xsize 1160 ysize 800
        vbox:
            spacing 16
            hbox:
                xfill True
                text title style "heading" xmaximum 840
                textbutton "Close" action close_action style "action_button" xalign 1.0 id "close_reading"
            text subtitle style "fine_print"
            viewport:
                id "reading_viewport"
                xsize 1076 ysize 590
                mousewheel True draggable True arrowkeys True pagekeys True
                scrollbars "vertical"
                side_yfill True
                vbox:
                    xsize 1025 spacing 22
                    transclude

screen evidence(clue_id):
    modal True
    zorder 100
    $ clue = harbor_clues[clue_id]
    use reading_panel(clue["title"], clue["subtitle"]):
        for field in ("observation", "model"):
            $ reading = clue[field]
            text reading["label"] style "subheading"
            text reading["value"] size 30
            text reading["detail"] size 27 line_spacing 7
        text "What remains uncertain" style "subheading"
        text clue["contradiction"] size 27 line_spacing 7

screen field_notes():
    modal True
    zorder 100
    use reading_panel("Field notes", "Mara + Kite · observations, possibilities, next steps", Hide("field_notes")):
        if not inspected:
            text "The harbor is still an open question."
        for clue_id in inspected:
            $ clue = harbor_clues[clue_id]
            text clue["title"] style "subheading"
            text ("Observed: " + clue["observation"]["value"]) size 27
            text clue["contradiction"] style "fine_print"
        if exhibit_read:
            text "The Night of Two Waters" style "subheading"
            text "Storm tide and hill runoff met in the lower city. A refuge beneath the east breakwater kept a listening line to shore." size 27
        if discovered:
            text record["heading"] style "subheading"
            text record["text"] size 28
            text "The replica’s six ribs fit our partial sonar. A possible location, not a date or an explanation for today’s warmth or lights." size 25
        if lead_choice:
            $ lead = next(item for item in museum_content["leads"] if item["id"] == lead_choice)
            text ("Next step: " + lead["label"]) style "subheading"
            text lead["detail"] size 27
        text "Sensor readings and historical records are authored fiction. Models remain hypotheses." style "fine_print"

screen harbor_departure():
    modal True
    frame:
        style "panel_frame"
        xalign 0.5 yalign 0.55 xsize 1000
        vbox:
            spacing 24
            text "A question worth keeping." style "heading"
            text museum_content["museumCopy"]["invitation"] size 30
            textbutton "Visit the Hall of Waters  ›" action Return() style "action_button" id "visit_museum"

screen museum_explore():
    modal True
    frame:
        style "panel_frame"
        xpos 80 ypos 580 xsize 1440
        vbox:
            spacing 24
            text "One flood line. Two versions of the ending." style "heading"
            text museum_content["museumCopy"]["explore"] size 28 line_spacing 5
            hbox:
                spacing 26
                textbutton "Read the history wall" action Return("history") style "action_button" id "history_wall"
                textbutton "Try the tide model  ›" action Return("model") style "action_button" id "tide_model"
    text "HALL OF WATERS" xpos 80 ypos 160 size 64 color "#fff0cd" outlines [(2, "#173e40", 0, 2)]

screen history_exhibit():
    modal True
    zorder 100
    use reading_panel(exhibit["title"], "Permanent collection · read at your pace"):
        text exhibit["introduction"] size 32 italic True color "#ffe2ac"
        for section in exhibit["sections"]:
            text section["title"] style "subheading"
            for paragraph in section["paragraphs"]:
                text paragraph size (32 if persistent.large_text else 28) line_spacing 9
        text exhibit["source"] style "fine_print"
        textbutton "Return to the gallery" action Return() style "action_button" id "exhibit_done"

screen flood_reconstruction():
    modal True
    frame:
        style "panel_frame"
        xpos 80 ypos 112 xsize 1440 ysize 710
        vbox:
            spacing 20
            text "The Night of Two Waters" style "heading"
            text "A simplified museum reconstruction · change the gate, then follow the night" style "fine_print"
            hbox:
                spacing 14
                textbutton "1 · Storm tide" action SetVariable("flood_stage", 0) selected flood_stage == 0 style "action_button" id "stage_tide" keysym "K_1"
                textbutton "2 · Hill runoff" action SetVariable("flood_stage", 1) selected flood_stage == 1 style "action_button" id "stage_rain" keysym "K_2"
                textbutton "3 · Dawn" action SetVariable("flood_stage", 2) selected flood_stage == 2 style "action_button" id "stage_dawn" keysym "K_3"
            hbox:
                spacing 38
                vbox:
                    xsize 650 spacing 17
                    if flood_stage == 0:
                        text "The sea comes in" style "subheading"
                        text ("Gate open: the storm tide reaches the lower streets. Closing the gate can hold it outside." if gate_open else "Gate closed: the storm tide is held outside. The lower streets have a little time.") size 28 line_spacing 5
                    elif flood_stage == 1:
                        text "The hills send a second water" style "subheading"
                        text ("Gate open: some rainwater can drain, but the tide enters too. The street level still rises." if gate_open else "Gate closed: runoff collects behind the sea wall. Holding back the sea now traps the rain.") size 28 line_spacing 5
                    else:
                        text "The crews take local control" style "subheading"
                        text "Pump crews remove the authorization locks. Ferries and neighbors share routes. The model clears the streets as the tide falls." size 28 line_spacing 5
                    textbutton ("Sea gate: OPEN · close it" if gate_open else "Sea gate: CLOSED · open it"):
                        action ToggleVariable("gate_open") style "action_button" id "gate_control" sensitive flood_stage < 2
                    text "Water response: an illustration of the competing pressures, not a fluid simulation." size 20 color "#e1c999"
                fixed:
                    xsize 620 ysize 290
                    add Solid("#6b8c81") xpos 230 ypos 125 xsize 360 ysize 85
                    add Solid("#69b5c580") xpos 10 ypos 80 xsize 190 ysize 150
                    add Solid("#7ac5b4aa") xpos 225 ypos (180 if flood_stage == 2 else 95 if flood_stage == 1 else 110 if gate_open else 190) xsize 370 ysize (35 if flood_stage == 2 else 120 if flood_stage == 1 else 105 if gate_open else 25)
                    add Solid("#e1c28b") xpos 205 ypos (150 if gate_open else 70) xsize 12 ysize (50 if gate_open else 130)
                    text "SEA" xpos 28 ypos 28 size 21
                    text "LOWER STREETS" xpos 260 ypos 28 size 21
                    text "REFUGE" xpos 370 ypos 230 size 21 color "#f9dda4"
                    if flood_stage == 2:
                        textbutton "✦ Lamp still lit  ›":
                            xpos 295 ypos 150 style "action_button" text_size 24
                            action Return("lamp") id "refuge_lamp"
                    elif perception:
                        text "Shared model · water paths" xpos 225 ypos 260 size 20 color "#adf8de"
            if flood_stage == 2:
                text "Recorded observation · the handover log keeps a refuge lamp lit after the last ferry is clear. Inspect the lamp to look closer." size 25 color "#b3f2d5"
            else:
                text "Kite: “There isn’t one setting that keeps both waters out. The people at the controls had to keep talking.”" size 25 italic True
            textbutton "Leave the model for now" action Return("leave") style "action_button" id "leave_model"

screen refuge_record():
    zorder 20
    frame:
        background Solid("#ecd7ab")
        xpos 660 ypos 155 xsize 850 padding (36, 30)
        vbox:
            spacing 18
            text record["heading"] size 24 color "#5c523f"
            text record["designation"] size 29 color "#294849"
            text record["text"] size 35 color "#203e40" line_spacing 8
            text record["caption"] size 20 color "#5c523f"

screen chapter_complete():
    modal True
    use scene_hud
    frame:
        style "panel_frame"
        xalign 0.5 yalign 0.55 xsize 1160
        vbox:
            spacing 23
            text "END OF CHAPTER ONE" style "fine_print"
            text (museum_content["museumCopy"]["completionTitle"] if discovered else "Two waters. An unfinished account.") style "heading"
            text (museum_content["museumCopy"]["completion"] if discovered else "The city survived through shared control. There may be more to find in the model’s dawn record.") size 31
            if lead_choice:
                $ lead = next(item for item in museum_content["leads"] if item["id"] == lead_choice)
                text ("Your next step: " + lead["label"]) style "subheading"
            text "This playable slice ends here. Your evidence and chosen lead are in the notes." style "fine_print"
            hbox:
                spacing 18
                textbutton "Review field notes" action Show("field_notes") style "action_button"
                textbutton "Read the history wall" action Show("exhibit_review") style "action_button"
                textbutton "Main menu" action MainMenu(confirm=False) style "action_button" id "chapter_done"
            textbutton "Revisit the flood reconstruction" action Return("revisit") style "action_button"

screen exhibit_review():
    modal True
    zorder 100
    use reading_panel(exhibit["title"], "Hall of Waters · permanent collection", Hide("exhibit_review")):
        for section in exhibit["sections"]:
            text section["title"] style "subheading"
            for paragraph in section["paragraphs"]:
                text paragraph size (32 if persistent.large_text else 28) line_spacing 9

screen opening_ready():
    modal True
    add "images/opening/room.webp" at background_fit
    frame:
        style "panel_frame"
        xalign 0.5 yalign 0.78 xsize 1000
        vbox:
            spacing 20
            text "A little wider." style "heading"
            text "Mara and Kite open a shared point of view. A 34-second prologue." size 28
            hbox:
                spacing 20
                textbutton "Begin with sound" action Return("sound") style "action_button"
                textbutton "Watch silently" action Return("silent") style "action_button"
                textbutton "Skip opening" action Return("skip") style "action_button" id "skip_opening"

screen opening_controls():
    zorder 100
    key "K_ESCAPE" action Jump("opening_done")
    textbutton "Skip opening  ›" action Jump("opening_done") style "action_button" xalign 0.96 ypos 35

screen opening_caption(who, line):
    frame:
        background Solid("#092d39da")
        xalign 0.5 ypos 720 padding (35, 24)
        text "[who] · [line]" size 33

screen menu_shell(title):
    tag menu
    modal True
    zorder 100
    add "images/harbor.webp" at background_fit
    use reading_panel(title, "Solar Commons", Return()):
        transclude
        null height 10
        textbutton "Return to story" action Return() style "action_button"
        textbutton "Main menu" action MainMenu() style "action_button"

screen preferences():
    use menu_shell("Preferences"):
        hbox:
            spacing 16
            textbutton "Window" action Preference("display", "window") style "action_button"
            textbutton "Fullscreen" action Preference("display", "fullscreen") style "action_button"
        textbutton "Reduce motion" action ToggleField(persistent, "reduce_motion") style "action_button"
        textbutton "Larger text" action ToggleField(persistent, "large_text") style "action_button"
        textbutton "Mute all sound" action Preference("all mute", "toggle") style "action_button"
        text "Music volume" style "subheading"
        bar value Preference("music volume") xsize 800
        text "Sound effects and opening clip" style "subheading"
        bar value Preference("sound volume") xsize 800
        text "Text speed" style "subheading"
        bar value Preference("text speed") xsize 800
        text "Enter / Space: continue · 1 / 2: choose · C: perception · J: notes · Esc: menu or close\nMouse wheel up / Page Up: rollback · V: native self-voicing on supported desktops\nStandard controller: D-pad to focus, A/Cross to select, B/Circle to return." style "fine_print"

screen save():
    use file_slots("Save", "save")

screen load():
    use file_slots("Load", "load")

screen file_slots(title, mode):
    use menu_shell(title):
        text "Manual saves · six slots" style "fine_print"
        for slot in range(1, 7):
            hbox:
                spacing 20
                textbutton (str(slot) + " · " + FileTime(slot, empty="Empty slot", format="%b %d, %H:%M")):
                    style "action_button" xsize 780
                    action (FileSave(slot) if mode == "save" else FileLoad(slot))
                    id ("save_slot_" + str(slot))
                textbutton "Delete" action FileDelete(slot) style "action_button" text_size 20

screen history():
    use menu_shell("Dialogue history"):
        for line in _history_list:
            if line.who:
                text line.who style "subheading"
            text line.what size 27 substitute False

screen confirm(message, yes_action, no_action):
    modal True
    zorder 200
    add Solid("#001c28d9")
    frame:
        style "panel_frame" xalign 0.5 yalign 0.5 xsize 900
        vbox:
            spacing 25
            text message size 30
            hbox:
                spacing 24
                textbutton "Yes" action yes_action style "action_button" id "confirm_yes"
                textbutton "No" action no_action style "action_button"
    key "game_menu" action no_action

screen notify(message):
    zorder 200
    frame:
        style "panel_frame" xalign 0.5 ypos 105
        text message size 25
    timer 3.0 action Hide("notify")
