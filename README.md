# Text placeholders (MSTextLayer)
    
    In layer name:
        - completely replaces the contents of the text layer
        - can be used for font icons
        - the name can contain other text, conditional actions, args, etc
        - only the first placeholder is considered if multiple exist
    
    In layer content:
        - each placeholder is treated as per usual
    
    Placeholder examples (usable in layer name and content): 
        - {firstName}, {name.first} - John
        - {firstName, lastName | & • } - John • Doe
        - {(lastName?, firstName | &, ), DOB | & born on } - Doe, John born on 14/07/1970
        - {firstName | upper} - JOHN
        - {firstName | upper | max 2} - JO
        - {(firstName | upper | max 2), (lastName | max 1) | & • } - JO • D
        - {keypath?} - The default substitute
        - {keypath?not available} - not available
        
    Args (standard CLI args):
        -l n - set n as the max number of lines in a fixed size text layer
        

# Image placeholders (MSShapeGroup, MSBitmapLayer)
    
    - sets the fill of the layer to the image (creates a new fill if needed, e.g. for a bitmap layer)
    
    Placeholder examples:
        - {avatarImage}
        - {avatar.image}
        
      
# Filters

    Filters are used via the pipe (|) operator and can be chained. Each filter has a name and an alias, e.g. join and &. More filters can be easily implemented.

      
# Conditional actions

    - actions that get executed based on a condition applicable to the specific layer
    - can be added to any layer (even text layers whose names contain a placeholder)
    
    Actions:
        - #show[condition] - shows layer if true and hides otherwise
        - #hide[condition] - hides layer if true and shows otherwise
        - #lock[condition] - locks layer if true and unlocks otherwise
        - #unlock[condition] - unlocks layer if true and locks otherwise
        - #delete[condition] - deletes the layer if the condition is true
        - #plugin[condition, command path] - runs the specified plugin command if condition is true
        
    Example actions:
        - #plugin["{name}".length > 2, Some Plugin > The Command]