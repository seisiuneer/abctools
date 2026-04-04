#include "ExpressionMapper.h"
#include <algorithm>

float ExpressionMapper::toGain(int value, ExpressionSource source) {
    if (source == ExpressionSource::Fixed)
        return 1.0f;
    return std::clamp(static_cast<float>(value) / 127.0f, 0.0f, 1.0f);
}
