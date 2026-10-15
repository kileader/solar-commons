# Exercise native menus, reading screens and state across all authored routes.
testsuite global:
    setup:
        $ _test.timeout = 8.0
        $ _test.transition_timeout = 0.05
        skip until screen "main_menu"
    teardown:
        exit

testsuite story:
    before testcase:
        if not screen "main_menu":
            run MainMenu(confirm=False)
        click id "begin_story"
        assert screen "opening_ready" timeout 10
        click id "skip_opening"

    testcase chapter_routes:
        parameter entry = ["Show me what we actually know.", "Let me see the harbor with you."]
        parameter ending = ["Let’s map it without disturbing it.", "Send a quiet introduction."]
        parameter gates = [False, True]
        parameter lead = ["Follow the listening line.", "Find the missing voice."]

        $ capture_route = entry.startswith("Show") and ending.startswith("Let") and gates and lead.startswith("Follow")

        advance until screen "choice"
        click expression entry
        advance until screen "harbor_explore"
        assert eval inspected == []
        if eval capture_route:
            pause 0.2
            screenshot "harbor.png"
            click "Shared perception"
            assert eval perception
            pause 0.2
            screenshot "perception.png"
            click "Shared perception"
        click id "geometry"
        assert screen "evidence"
        assert eval inspected == ["geometry"]
        keysym "K_ESCAPE"
        advance until screen "harbor_explore"
        click id "geometry"
        keysym "K_ESCAPE"
        advance until screen "harbor_explore"
        assert eval len(inspected) == 1
        click id "thermal"
        keysym "K_ESCAPE"
        advance until screen "harbor_explore"
        click id "archive"
        keysym "K_ESCAPE"
        advance until screen "harbor_explore"
        assert eval len(inspected) == 3
        click id "conclude"
        click expression ending
        advance until screen "harbor_departure"
        click id "visit_museum"
        advance until screen "museum_explore"
        if eval capture_route:
            pause 0.2
            screenshot "museum.png"
        # Read in only half the routes: history is never a discovery gate.
        if eval gates:
            click id "history_wall"
            assert screen "history_exhibit"
            assert eval exhibit_read
            if eval capture_route:
                pause 0.2
                screenshot "exhibit.png"
                scroll id "reading_viewport" amount 80
                pause 0.2
                screenshot "exhibit-bottom.png"
            keysym "K_ESCAPE"
            assert screen "museum_explore"
        click id "tide_model"
        advance until screen "flood_reconstruction"
        click id "stage_rain"
        if eval gates:
            click id "gate_control"
        assert eval gate_open == gates
        if eval capture_route:
            pause 0.2
            screenshot "reconstruction.png"
        click id "stage_dawn"
        click id "refuge_lamp"
        advance until screen "refuge_record"
        assert eval discovered
        assert eval harbor_ending in ("survey", "handshake")
        if eval capture_route:
            pause 0.2
            screenshot "discovery.png"
            run FileSave("qa-discovery", confirm=False)
            run SetVariable("discovered", False)
            assert eval not discovered
            run FileLoad("qa-discovery", confirm=False)
            assert eval discovered
        advance until screen "choice"
        click expression lead
        if eval capture_route:
            run Rollback()
            assert screen "choice"
            assert eval lead_choice is None
            click expression lead
        advance until screen "chapter_complete"
        assert eval lead_choice == ("stair" if lead.startswith("Follow") else "voices")
        if eval capture_route:
            pause 0.2
            screenshot "chapter-complete.png"
        click "Review field notes"
        assert screen "field_notes"
        keysym "K_ESCAPE"
        click "Read the history wall"
        assert screen "exhibit_review"
        keysym "K_ESCAPE"

    testcase new_game_resets:
        advance until screen "choice"
        assert eval inspected == [] and harbor_ending is None and not discovered
        assert eval lead_choice is None and not exhibit_read
        assert eval not perception

    testcase optional_reconstruction:
        # The full harbor path is covered above. Enter museum through its real label here.
        run SetVariable("harbor_ending", "survey")
        run Jump("museum_chapter")
        advance until screen "museum_explore"
        click id "tide_model"
        advance until screen "flood_reconstruction"
        click id "leave_model"
        advance until screen "chapter_complete"
        assert eval not discovered and lead_choice is None
        click "Revisit the flood reconstruction"
        assert screen "flood_reconstruction"
        click id "stage_dawn"
        click id "refuge_lamp"
        advance until screen "choice"
        click "Find the missing voice."
        advance until screen "chapter_complete"
        assert eval discovered and lead_choice == "voices"

testsuite presentation:
    before testcase:
        if not screen "main_menu":
            run MainMenu(confirm=False)
        click id "begin_story"
        assert screen "opening_ready"

    testcase opening_modes:
        parameter mode = ["Watch silently", "Begin with sound"]
        click expression mode
        skip until screen "say" timeout 45
        assert eval location == "The Harbor" and inspected == []
        assert eval _preferences.get_mute("music") == (mode == "Watch silently")
        click "Menu"
        assert screen "preferences"
        click "Larger text"
        click "Reduce motion"
        assert eval persistent.large_text and persistent.reduce_motion
        keysym "K_ESCAPE"
        assert screen "say"
        run SetField(persistent, "large_text", False)
        run SetField(persistent, "reduce_motion", False)
