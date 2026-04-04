#pragma once

enum class ExpressionSource { CC2, CC7, CC11, CC74, ChannelPressure, Velocity, Fixed };

class ExpressionMapper {
public:
    // Maps a MIDI value (0–127) to a gain multiplier (0.0–1.0).
    // ExpressionSource::Fixed always returns 1.0 regardless of value.
    static float toGain(int value, ExpressionSource source);
};
