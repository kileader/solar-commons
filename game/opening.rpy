# The existing eight-shot opening, with the accepted S01 clip and still artwork.
label opening:
    scene expression Solid("#0c2930")
    call screen opening_ready
    if _return == "skip":
        return
    $ opening_sound = _return == "sound"
    $ _preferences.set_mute("music", not opening_sound)
    $ _preferences.set_mute("sfx", not opening_sound)
    show screen opening_controls
    if not persistent.reduce_motion and not renpy.is_in_test():
        $ renpy.movie_cutscene("media/opening/s01-connection.mp4", delay=3.0, stop_music=False)
    else:
        scene expression "images/opening/room.webp" at background_fit
        pause 3.0
    if opening_sound:
        play music "audio/opening.ogg" noloop fadein 0.3
    scene expression "images/opening/consent-ready.webp" at background_fit
    show screen opening_caption("Mara", "A little wider, then.")
    pause 0.85
    scene expression "images/opening/consent-pressed.webp" at background_fit
    pause 2.15
    scene expression "images/opening/kite.webp" at background_fit
    show screen opening_caption("Kite", "Your pace. Your choice.")
    pause 4.0
    scene expression "images/opening/threshold.webp" at background_fit
    show screen opening_caption("Kite", "Follow this.")
    pause 6.0
    scene expression "images/opening/shared.webp" at background_fit
    show screen opening_caption("Kite", "With you.")
    pause 6.0
    hide screen opening_caption
    scene expression "images/opening/mara.webp" at background_fit
    pause 3.0
    scene expression "images/opening/city.webp" at background_fit
    pause 5.0
    scene bg harbor at background_fit
    pause 4.0
label opening_done:
    hide screen opening_controls
    hide screen opening_caption
    stop movie
    stop music fadeout 0.3
    return
