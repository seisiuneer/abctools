#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "ExpressionMapper.h"

using Catch::Approx;

TEST_CASE("ExpressionMapper: Fixed source always returns 1.0", "[ExpressionMapper]") {
    REQUIRE(ExpressionMapper::toGain(0,   ExpressionSource::Fixed) == Approx(1.0f));
    REQUIRE(ExpressionMapper::toGain(64,  ExpressionSource::Fixed) == Approx(1.0f));
    REQUIRE(ExpressionMapper::toGain(127, ExpressionSource::Fixed) == Approx(1.0f));
}

TEST_CASE("ExpressionMapper: Velocity 0 yields gain 0.0", "[ExpressionMapper]") {
    REQUIRE(ExpressionMapper::toGain(0, ExpressionSource::Velocity) == Approx(0.0f));
}

TEST_CASE("ExpressionMapper: Velocity 127 yields gain 1.0", "[ExpressionMapper]") {
    REQUIRE(ExpressionMapper::toGain(127, ExpressionSource::Velocity) == Approx(1.0f));
}

TEST_CASE("ExpressionMapper: Velocity 64 yields gain roughly 0.5", "[ExpressionMapper]") {
    float g = ExpressionMapper::toGain(64, ExpressionSource::Velocity);
    REQUIRE(g > 0.49f);
    REQUIRE(g < 0.51f);
}

TEST_CASE("ExpressionMapper: CC2 behaves same as Velocity (linear 0-1)", "[ExpressionMapper]") {
    REQUIRE(ExpressionMapper::toGain(0,   ExpressionSource::CC2) == Approx(0.0f));
    REQUIRE(ExpressionMapper::toGain(127, ExpressionSource::CC2) == Approx(1.0f));
}

TEST_CASE("ExpressionMapper: CC7 behaves same as Velocity", "[ExpressionMapper]") {
    REQUIRE(ExpressionMapper::toGain(0,   ExpressionSource::CC7) == Approx(0.0f));
    REQUIRE(ExpressionMapper::toGain(127, ExpressionSource::CC7) == Approx(1.0f));
}

TEST_CASE("ExpressionMapper: all sources clamp to [0,1]", "[ExpressionMapper]") {
    for (auto src : {ExpressionSource::CC2, ExpressionSource::CC7, ExpressionSource::CC11,
                     ExpressionSource::CC74, ExpressionSource::ChannelPressure,
                     ExpressionSource::Velocity}) {
        float g0   = ExpressionMapper::toGain(0,   src);
        float g127 = ExpressionMapper::toGain(127, src);
        float gNeg = ExpressionMapper::toGain(-1,  src);
        float g200 = ExpressionMapper::toGain(200, src);
        REQUIRE(g0   >= 0.0f);
        REQUIRE(g127 <= 1.0f);
        REQUIRE(gNeg >= 0.0f);   // below range
        REQUIRE(g200 <= 1.0f);   // above range
    }
}
