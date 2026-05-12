package com.spendwise.SpendWise.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Parses and normalizes monetary amounts to 2 decimal places (HALF_UP).
 * Avoids {@code double} / {@link Double} drift for values like 350000.
 */
public final class MoneyAmountUtil {

    public static final int SCALE = 2;
    public static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private MoneyAmountUtil() {
    }

    public static BigDecimal parse(Object value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        }
        String s = value.toString().trim();
        if (s.isEmpty()) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        }
        try {
            return new BigDecimal(s).setScale(SCALE, ROUNDING);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        }
    }
}
