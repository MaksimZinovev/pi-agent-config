This article describes the settings and functions of the Controller Manager menu in TRAKTOR's Preferences. You can also view the [video version](https://support.native-instruments.com/hc/articles/210294945) of this article. The Controller Manager is the place to create, edit, import and export controller mappings. A controller mapping establishes a relationship between the control elements (knobs, faders, buttons, encoders) of your hardware MIDI controller and the functions of the TRAKTOR software. Each function of the software can be mapped to one or several user-defined control elements of the hardware controller. The **Device Setup** allows you to globally manage your controller mappings, or **Devices**. Each individual control of the currently selected **Device** is added to the **Assignment Table** of the mapping. Furthermore, a user can specify the behavior and other properties of each command in the **Mapping Details** section. All changes made in the Controller Manager will come into effect immediately. This means that you can keep it open while configuring your controller and check the added functionality simultaneously in the main Traktor user interface. You may also resize the window by dragging the edges of the Preferences window.

_Note: If you own a [Traktor Ready](https://support.native-instruments.com/hc/articles/209557129 "Opens external link in new window") controller, we advice you to load the predefined mapping automatically via the Setup Wizard. [This](https://support.native-instruments.com/hc/articles/210294325 "Opens external link in new window") article explains how to do it._

## Device Setup

![Device Setup](https://support.native-instruments.com/hc/article_attachments/205532305 "Device Setup")  
In this section you can manage the mappings for your devices and set their most basic properties, including the computer keyboard, MIDI and (Advanced) HID controllers. It consists of the follow menus and sub-menus:

## Assignment Table

![Assignment Table](https://support.native-instruments.com/hc/article_attachments/205486909 "Assignment Table")  
The Assignment Table lists all assignments for the mapping you've currently selected from the **Device** list. Here you can assign control elements of your MIDI controller (or keys of your computer keyboard) to specific functions of the TRAKTOR software. Each row in the **Assignment Table** represents a single assignment.

_Note: You can sort the **Assignment Table** by any column if you click on its header. This can be very useful with large mappings. You may add appropriate comments for each Assignment starting with specific keywords. This way you can group your Assignments by individual attributes._

### Assignment Table Overview

The eight columns in the **Assignment Table** display the most important information specific to your assignments:

-   **Control**: This is the name of the **Control** (the type of action, or function, to be triggered in TRAKTOR). You can add **Controls** via the **Add In...** and **Add Out...** buttons, which are explained further below.
-   **I/O**: States if an Assignment is used for a input or output **Control**. Use MIDI input **Controls** when you want to assign a TRAKTOR function to a control element on your hardware device. MIDI output **Controls** are mostly used when your controller has the ability to receive feedback and visualize panel elements to show the current state in the software user interface. MIDI output signals are generally visualized as lighting or blinking LEDs on your MIDI controller.
-   **Assignment**: This is the target section for the **Control** in TRAKTOR. The **Assignment** can be changed in the **Mapping Details** section as explained below.
-   **Mode**: Shows the **Interaction Mode** set for a **Control** in the **Mapping Details** section. The available modes depend on the selected type of hardware control element. The meaning of the **Interaction Modes** is explained in the **Mapping Details** section below.
-   **Mapped to**: This shows either the control source (for input **Controls**) or the target (for output **Controls**) of each individual mapping in the **Assignment Table**. The values for this parameter are displayed as Control Change numbers and their respective MIDI channel (Channel.CC) or as Note numbers and their respective MIDI channel (Channel.Note). Mappings for devices supporting our own NHL protocol (the whole range of TRAKTOR controllers) or the HID protocol (Pioneer, Denon) will display named **Mapped to** values corresponding to the label of the control element on the device (e.g. **Left.Jog.Encoder**, **A.CUE**, as shown in the screenshot above).
-   **Cond1** and **Cond2**: Shows the values for the **Modifier Conditions** as set in the **Mapping Details** section (see below).
-   **Comment:** Use this field to enter a comment for your assignment. This is useful for keeping an overview of what your mapping is doing at a user-specific level.

### Assignment Table Functions

The Assignment Table additionally features four buttons for adding, duplicating and deleting assignments. These buttons and their functions are explained below.

-   **Add In...:** Adds a new MIDI input **Control** to your mapping. The added assignment will be displayed in the **Assignment Table** as a new row. Clicking on **Add In...** opens a drop-down list which groups the available **Controls** in functional categories. For example, the **Add In... > Deck Common > Loop > Loop Active On** adds an input **Control** that allows the user to activate a Loop in the song loaded to a Deck. The target deck is determined by the **Device Target** setting in the **Device Setup** (as explained above) as well as the **Assignment** setting in the **Mapping Details** section for this **Control** (as explained below).
-   **Add Out...:** Adds a new MIDI output assignment **Control** to your mapping. The added assignment will be displayed in the **Assignment Table** as a new row. Clicking on **Add Out...** opens a drop-down list which groups the available **Controls** in functional categories. For example, the **Add Out... > Deck Common > Loop > Loop Active On** adds an output **Control** which sends a feedback MIDI message to your controller whenever a Loop in the corresponding Deck is set active.
    
    Note: You can find detailed information about the Add In... / Add Out... menus in Chapter 20 of the TRAKTOR user manual.
    
-   **Duplicate:** Duplicates the currently selected assignment in the **Assignment Table**, adding a new row with an exact copy of the selected assignment.
-   **Delete:** Deletes the currently selected assignment from the **Assignment Table**.

The currently selected assignment in the **Assignment Table** will be highlighted in yellow. If there is another **Control** in the list which has the same source assigned in the **Mapped to** column as the selected assignment, this will be highlighted as well in a darker yellow. This feature is useful for debugging large mapping lists.

## Device Mapping

![](https://support.native-instruments.com/hc/article_attachments/205486929)  
In the **Device Mapping** area you can map a control element of your device to the currently selected **Control** (or TRAKTOR function) in the **Assignment Table**.

-   **Learn**: This function is available for control elements on MIDI controllers, computer keyboard and HID devices. It allows you to automatically map the control element of your device to the currently selected TRAKTOR **Control** by pressing, turning or moving it. The **Learn** function automatically recognizes the MIDI source (\*Channel.CC\* or \*Channel.Note\*) associated with the control element you moved and maps it to the selected **Control** in TRAKTOR. Click on **Learn** so that it is highlighted in yellow. Now push / turn / move the desired element of your MIDI controller until you see that the corresponding MIDI source is set in the assignment field next to the **Learn** button (see **Assignment** drop-down below). The **Learn** mode will remain active until you press the button again. This allows to assign several **Controls** in one go. Do not forget to disable **Learn** again when you are done. This will avoid undesired assignments for your MIDI source.
-   **Assignment drop-down**: Here you can manually assign a control element of your device. This is the only way to assign a MIDI output **Control** to add visual feedback to LEDs on your device. The available assignments include MIDI CC, Note or Pitchbend messages, which all are available for any of the 16 MIDI channels. If no assignment is working, check which MIDI channel your MIDI controller is set to for sending and receiving MIDI. This can usually be adjusted in all MIDI devices.
    
    _Note: Please refer to the documentation of your MIDI controller for a reference list of the MIDI Control Change and Note numbers associated with the control elements. In most cases, these are the same for input and output messages, however in some cases a control element may send out a different message than the associated LED is configured to receive. This depends on the manufacturer's specification of the hardware and drivers._
    
-   **Reset**: This button removes the assignment.
-   **Comment**: In this field you can enter a comment which is stored with the **Control** assignment. It appears in the **Comment** field of the **Assignment Table** as described before.

## Mapping Details

![Mapping Details](https://support.native-instruments.com/hc/article_attachments/205532345 "Mapping Details")

### Modifier Conditions

Modifiers are **Control** types in TRAKTOR which can be used to define conditions for other assignments in the same mapping. A modifier's value can range from 0-8 depending on the type of hardware control element it is mapped to. The actual values of the Modifiers are shown in the **Modifier State** section. You can define Modifiers and their values as a condition for any assignment via the **Modifier Conditions** setting. The **Control** will only be active if all conditions are met. This way you can assign different functions to the same control element, each with their own unique set of conditions. Different assignments of the same control element can be enabled depending on which Modifier values are set. For example, Modifiers can be used to set up a shift button or key to toggle between different assignments for other control elements. This way you can extend the functionality of a controller with a limited number of control elements. It can also be used for a variety of creative applications where a number of Controls depend on each other. In the screenshot above, the **Modifier Conditions** for the selected assignment read as follows: The assignment will take effect if the value of Modifier M1 is 0 and the value of Modifier M2 is 1 (or short: IF M1=0 AND M2=1). In order to change the value of a Modifier, the corresponding **Modifier Controls** (M1...M8) need to be assigned to control elements of your device. They can be added to the **Assignment Table** via the **Add In.../ Add Out... > Modifier #** command.

_Note: A basic tutorial about using Modifiers can be found at the end of this article. Make sure you fully grasp the concept of Modifiers before using them, as Modifier mappings can become very complex and difficult to troubleshoot. **Modifier Conditions** are optional, so if you want to keep your mapping simple, you may ignore those fields and leave them blank._

### Control Behaviour and Assignment

In the lower section of the **Mapping Details** you can find the following important settings. These determine how the control element on your device interacts with the function in TRAKTOR it is assigned to.

-   **Type of Controller**: The choices given for the **Type of Controller** are specific to the control target (or TRAKTOR function) of the currently selected assignment. For example, the **Play/Pause** function only allows **Button** controllers, other parameters (such as **Filter Adjust** or **Volume Adjust**) also allow to assign **Fader / Knob** controllers.
    -   **Button**: Use this **Type of Controller** if your are assigning a function to a push button or two-stage switch on your device.
    -   **Fader / Knob**: Use this **Type of Controller** if you are assigning a function to a standard rotary knob on your device (analogue potentiometer).
    -   **Encoder**: Use this **Type of Controller** if you are assigning a function to an endless dial on your device (digital encoder).

-   **Interaction Mode**: The options available for the **Interaction Mode** will vary depending on both the **Type of Controller** as well as the control target of the currently selected assignment. For example, the Interaction Modes for the **Play/Pause** control (with **Button** set as the **Type of Controller)** are **Toggle**, **Hold** and **Direct**. The Interaction Modes for the **Tempo** control (with **Button** set as the **Type of Controller)** are **Direct**, **Inc**, **Dec** and **Reset**.
    -   **Interaction Mode** (Button): Below is a list the available Interaction Modes with **Type of Controller** set to **Button**.
        -   **Toggle**: When you press and release the MIDI button or computer keyboard key, the TRAKTOR button becomes enabled. When you press and release it again, it becomes disabled again.
        -   **Hold**: This is the default setting for buttons. The TRAKTOR function will be active as long as your MIDI button or computer keyboard key is pressed. If you release the MIDI button or computer keyboard key, the TRAKTOR function will be disabled again.
        -   **Direct**: Sets the corresponding control to a defined value. Set this value by changing the **Set to value** field in the **Button Options** section. For example, assign a V**olume Adjust** control to a button. Set the **Interaction mode** to **Direct** and define a specific volume level under **Set to value**. Hitting the button will now always force the Volume Fader to jump to the specified value. For example, if you set the value to 1.000, the button will fully punch a channel into the mix with a single press.
        -   **Inc**: Increases the value of the respective TRAKTOR function by one step. Only applies when you are using a button to control a TRAKTOR function with more than two different possible values, for example the **Deck Volume** or the **Pitch Fader**.
        -   **Dec**: Decreases the value of the respective TRAKTOR function by one step. Only applies when you are using a button to control a TRAKTOR function with more than two different possible values, for example the **Deck Volume** or the **Pitch Fader**.
        -   **Reset**: Resets the value of the respective TRAKTOR function to it's default value. This is the same as when using the mouse and double-clicking a function in the TRAKTOR user interface. Only applies when you are using a button to control a TRAKTOR function with more than two different values, for example the **Deck Volume** or the **Pitch Fader**.

-   **Interaction Mode** (Fader / Knob or Encoder): There are two different modes available when the **Type of Controller** is set to **Fader / Knob** or **Encoder.**
    -   **Direct**: The position of the external control always matches the value of the TRAKTOR function. This mode is mainly intended for standard faders or standard rotary knobs (analogue potentiometers) with a limited control range.
    -   **Relative**: Moving the external control element will change the value of the TRAKTOR function relative to it's current position. This mode is mainly intended for endless dials (digital encoders). If you are using this mode with a standard rotary knob, the controllable range of the TRAKTOR function depends on it's initial value as well as the sensitivity and resolution of the encoder. For example, a common application for **Relative** mode to use it for the pitch fader control at high resolution. This allows to use the Sync function and then fine-control the pitch fader in addition to the position determined by Sync.
        
        _Note: The behaviour of a control element in the **Direct** and **Absolute** modes depends on it's hardware implementation as specified by the manufacturer of the device. We recommend to try different settings with both modes and monitor the results until you get the desired behaviour._
        

-   **Assignment:** This determines which area in TRAKTOR is going to be affected by the **Control**. It can be any of the following options.
    -   **Device Target:** The assignment will apply to the **Device Target** as defined in the **Device Setup** section (see above).
    -   **Deck A** through **D:** The assignment will apply to the specific Deck.
    -   **FX Unit 1** through **4:** The assignment will apply to the specific FX Unit.
    -   **Remix Deck 1** through **4**, **Slot** **1** through **4**: The assignment will apply to the specific Remix Deck Slot.
    -   **Global**: The assignment will apply to the whole TRAKTOR interface. Global assignments are reserved for actions that are not specific to Decks or FX Units (i.e. Browser, Loop Recorder, Modifiers).

## Button Options

This section will show up when **Button** is selected as the **Type of Controller**. It enables you to further refine the behaviour of the selected assignment. The given options are specific to the chosen **Interaction Mode** and **Control**. Below you can find a list of the most common options.

-   **Set to value** (Interaction Mode Direct): Choose a specfic value which is recalled when you hit the assigned button. The available range of numbers depends on the selected TRAKTOR control. Some controls only allow integers while others allow to define fractions.
-   **Invert** (Interaction Modes Toggle and Hold): Inverts the action. For an input controller this means that the TRAKTOR button is pressed when you release the MIDI button or computer keyboard key and vice versa.
-   **Auto Repeat** (Interaction Modes Inc and Dec): The function will be triggered repeatedly when you hold the button on your device down. This is only available for specific controls. For example, you can use this for the input controller **Browser > List > Select Up/Down**. If you set this control to **Button**, the **Interaction Mode** to **Inc** and then enable **Auto Repeat**, the cursor will scroll through the track list automatically as long as you keep the controller button pressed (no need to press the button for each step through the list).
-   **Resolution** (Interaction Modes Inc and Dec): Allows you to adjust the resolution of the steps when using a button to increase or decrease the amount of a function with more than two different values.

## Fader / Knob

This section will show up when **Fader / Knob** is selected as the **Type of Controller**. It enables you to further refine the behaviour of your assignment. The given options are specific to the **Interaction Mode** and **Control** of the selected Asignment. Below you can find a list of the most common options.

-   **Soft Takeover** (Interaction Mode Direct): Enable this to avoid parameter jumps when the value of the TRAKTOR function and the position of the hardware control element do not match. For example, the filter is set to -50% in the TRAKTOR user interface, however the knob on your controller assigned to the **Filter Amount** is fully opened. When you now begin to move the knob on your device with **Soft Takeover** disabled, the filter in TRAKTOR will immediately jump to the position of the external control. If **Soft Takeover** is enabled, you will first need to move the knob on your controller until it matches the position of the filter control in TRAKTOR. Only then the knob on your controller will 'take over' and change the **Filter Amount**.
-   **Invert** (Interaction Modes Direct and Relative): Inverts the action of your external control. High values of the control element become low values in TRAKTOR and vice versa.

## Rotary Encoder

This section will show up when **Encoder** is selected as the **Type of Controller**. It's also available for the **Fader / Knob** type in **Relative** mode. It enables you to further refine the behaviour of your assignment. The given options are specific to the chosen **Interaction Mode** and **Control**. Below you can find a list of the most common options.

-   **Rotary Sensitivity** (Interaction Mode Relative): Defines how fast the value of a TRAKTOR function will change relative to the movement of the assigned hardware control element. This setting also affects the available resolution of a control.
-   **Rotary Acceleration** (Interaction Mode Relative): Makes the parameter changes respond more sensitive to fast movements of the hardware control element than slow ones. With a setting of 0%, moving the control element in a particular range will always implicate the same parameter change in TRAKTOR. Increasing the **Rotary Acceleration** the parameter changes in TRAKTOR will be different for slow and fast movements of the control element.
-   **Invert** (Interaction Modes Direct and Relative): Inverts the action of your external control. High values of the control element become low values in TRAKTOR and vice versa.

## Example Modifier Mapping

Below you can find a basic example for a Modifier mapping. We are creating a single **Play/Pause** button on a MIDI controller, which can either control Deck A or Deck B. A 'Modifier toggle' button is used to switch the functionality back and forth between the two Decks. Step 1 explains how to create it. The 'Modifier toggle' is a very helpful mapping concept: One button is switching between two different Modifier states, usually 0 and 1. The Modifier will alternate between  the two values upon every press of the button. Step 2 explains how to make the **Play/Pause** function depend on the value of this Modifier in order to switch between the Decks.

### Step 1: Create a 'Modifier toggle' button

1.  Press **Add In...** and choose **Modifier > Modifier #1** from the drop-down list.
2.  Enter **Learn** mode and press a MIDI button on your controller to assign it.
3.  Make the following adjustments in the **Mapping Details** and **Button Options** sections:  
    ![Modifier Assignment](https://support.native-instruments.com/hc/article_attachments/205532365 "Modifier Assignment")
4.  While the Modifier is still selected in the **Assignment Table,** click the **Duplicate** button.
5.  Make sure that the **Learn** function is still active and press the same MIDI button again to assign it to the duplicated **Modifier #1** as well.
6.  Switch off **Learn** now.
7.  For the duplicated **Modifier #1**, change the **Modifier Conditions** to **M1** = **0** (instead of 1) and **Set to value** to **1** (instead of 0).
8.  The 'Modifier toggle' button is now ready. See the Modifier value toggle between 0 and 1 in the **Modifier State** section.

### Step 2: Use the Modifier to toggle the focus of the Deck Play/Pause button between Deck A and Deck B

1.  Press the **Add In...** button and choose **Deck Common** \> **Play/Pause** from the drop-down list.
2.  Enter **Learn** mode and press another MIDI button on your controller to assign it (use a different button, not the one you have assigned to the **Modifier #1**).
3.  Make the following adjustments in the **Mapping Details** section:  
    ![Play Assignment](https://support.native-instruments.com/hc/article_attachments/205486949 "Play Assignment")
4.  While **Play/Paus**e is still selected in the **Assignment Table,** click the **Duplicate** button.
5.  Make sure that the **Learn** function is still active and press the same MIDI button again to assign it to the duplicated **Play/Pause** as well.
6.  For the duplicated **Play/Pause**, change the **Modifier Conditions** to **M1** = **1** (instead of 0) and the **Assignment** to **Deck B** (instead of Deck A).
7.  Here is how your **Assignment Table** should look like:  
    ![Example Mapping](https://support.native-instruments.com/hc/article_attachments/205532385 "Example Mapping")
8.  You can now use your mapping. Play and pause either Deck A or B by pressing the **Play/Pause** button and switch between the Decks with the button assigned to the 'Modifier toggle' function.

## Related Articles