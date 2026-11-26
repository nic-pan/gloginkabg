# Original glog.dir.bg theme stylesheets

These files are copies of the original theme CSS from archived glogs on web.archive.org. Use them as the reference for the colors in `themes.json`. Screenshots can show wrong colors, so prefer these files.

The deploy workflow does not upload `tools/`.

## Theme map

| File | Our theme | Archived glog |
|---|---|---|
| `children_css.css` | `bloodOrange` (Слънчево ужилване) | uchilishte-mechta.dir.bg, 2007 |
| `children_css_2.css` | `candy` (Бонбон) | spomenche.dir.bg, 2008 |
| `css.css` | `skyBlue` (the dir.bg default theme) | gerganaworld.dir.bg, 2008 |
| `pink_css_1.css` | `purpleDream` (Виолетова мечта) | h2o-just-add-water-the-best.dir.bg, 2008 |
| `happy_css.css` | `garden` (Градинка) | supersite.dir.bg, 2018 |
| `green_css_2.css` | `leaf` (Листа от глог) | tokiohotel-fan.dir.bg, 2020 |
| `glow_css.css` | `bordeaux` (Бордо) | galaimotishumen.dir.bg, 2009 |
| `black_css.css` | `night` | viv.dir.bg, 2007 |
| `soft_css.css` | not built (teal, probably Тюркоаз) | krimi.dir.bg, 2007 |
| `red_ccs_1.css` | not built (red and gray, probably Гоблен) | gobelins.dir.bg |
| `red_ccs_2.css` | not built (red, probably Кармин) | imperio.dir.bg, 2008 |
| `green_css_1.css` | not built (dark green, probably Зелен терен) | evro2008.dir.bg, 2007 |
| `deep_blue_css.css` | not built (navy and slate) | dangerousclub.dir.bg, 2008 |

Not found yet: the beige theme (`braun_css`, housecosy.dir.bg). `white` (Класическа бяла) is our own theme for glogs with no color, so it has no original file.

## How to get another one

1. Find an archived page of a glog that uses the theme.
2. Download the page with `id_` after the timestamp, for example `https://web.archive.org/web/20080101000000id_/http://NAME.dir.bg/_wm/diary/?df=46&dflid=3`.
3. Search the HTML for `_wm/statics/<theme>/styles.css`.
4. Download that path from the same glog and timestamp.

## Class names

| dir.bg class | Our element |
|---|---|
| `.header_t1`, `.header_11` | prebar, prebar links |
| `.left_m_bgr`, `.left_nav` | sidebar, sidebar nav links |
| `.gloginki`, `.gloginki_tit`, `.gloginki_bull`, `.gloginki_more` | Глогинки widget |
| `.blog_arch_tb`, `.blog_3` | calendar widget box, "БЛОГ АРХИВ" title |
| `.cal_tb`, `.cal` | calendar weekday row and its text |
| `.center_fash` | section header |
| `.horz_nav` | topbar links |
| `.comment_td_1`, `.comment_td_2` | commenter box, comment box |
| `.footer_table` | footer |

## Screenshots that show unbuilt themes

The gallery screenshots in `assets/img/gallery/references/` show some themes we have not built yet:

| Screenshot | Look | Probable theme |
|---|---|---|
| housecosy.png | beige/brown header, tan section header, red links | braun_css (the missing beige theme) |
| revoluciqz.png | teal section header and calendar | soft_css |
| evro2008.png | dark green, yellow header frame | green_css_1 |
| gobelins.png, imperio.png | red header, gray or white sidebar | red_ccs_1 or red_ccs_2 |

The tokiohotel-fan.dir.bg catalog snapshot (2007-10) also uses soft_css.
